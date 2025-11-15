/**
 * Workflow Execution Engine
 * Triggers and executes workflows based on events (new messages, contact updates, etc.)
 */

import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Workflow } from "@/lib/firebase/workflows";
import { handleAIAutoReply } from "@/lib/ai/openai-service";
import { sendWhatsAppTextMessage } from "@/lib/messaging/whatsapp-sender";
import { sendInstagramTextMessage } from "@/lib/messaging/instagram-sender";

interface WorkflowExecutionContext {
  triggerId: string;
  tenantId: string;
  contactId: string;
  conversationId: string;
  messageContent?: string;
  messageId?: string;
  channel: "whatsapp" | "instagram";
  contactData?: {
    name: string;
    phone?: string;
    instagram_id?: string;
    tags: string[];
  };
  conversationHistory?: Array<{
    sender: string;
    content: string;
    timestamp?: any;
  }>;
}

interface ExecutionStep {
  stepNumber: number;
  nodeType: string;
  nodeLabel: string;
  action: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  startedAt?: Date;
  completedAt?: Date;
  output?: any;
  error?: string;
}

/**
 * Find workflows that should be triggered by an event
 */
export async function findTriggeredWorkflows(
  tenantId: string,
  triggerType: string,
  messageContent?: string
): Promise<Workflow[]> {
  try {
    const workflowsRef = collection(db, "workflows");
    const q = query(
      workflowsRef,
      where("tenant_id", "==", tenantId),
      where("is_active", "==", true),
      where("trigger_type", "==", triggerType)
    );

    const snapshot = await getDocs(q);
    const workflows: Workflow[] = [];

    for (const doc of snapshot.docs) {
      const workflow = { id: doc.id, ...doc.data() } as Workflow;

      // Additional filtering based on workflow config
      if (triggerType === "keyword_match" && messageContent) {
        const keywords = workflow.config?.keywords || [];
        const messageMatches = keywords.some((keyword: string) =>
          messageContent.toLowerCase().includes(keyword.toLowerCase())
        );
        if (messageMatches) {
          workflows.push(workflow);
        }
      } else {
        workflows.push(workflow);
      }
    }

    return workflows;
  } catch (error) {
    console.error("Failed to find triggered workflows:", error);
    return [];
  }
}

/**
 * Execute a single workflow
 */
export async function executeWorkflow(
  workflow: Workflow,
  context: WorkflowExecutionContext
): Promise<{ success: boolean; executionId?: string; error?: string }> {
  const executionId = `exec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const steps: ExecutionStep[] = [];

  console.log(`🚀 Executing workflow: ${workflow.name} (${workflow.id})`);

  try {
    // Create execution log
    const executionLogRef = await addDoc(collection(db, "execution_logs"), {
      workflow_id: workflow.id,
      workflow_name: workflow.name,
      tenant_id: context.tenantId,
      contact_id: context.contactId,
      conversation_id: context.conversationId,
      trigger_type: context.triggerId,
      status: "running",
      started_at: serverTimestamp(),
      context: {
        channel: context.channel,
        message_content: context.messageContent,
      },
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });

    // Get workflow nodes and edges from config
    const nodes = workflow.config?.nodes || [];
    const edges = workflow.config?.edges || [];

    // Find the starting node (trigger node)
    const startNode = nodes.find((node: any) => node.type === "trigger");

    if (!startNode) {
      throw new Error("No trigger node found in workflow");
    }

    // Execute nodes in sequence
    let currentNodeId = startNode.id;
    let stepNumber = 1;

    while (currentNodeId) {
      const currentNode = nodes.find((node: any) => node.id === currentNodeId);

      if (!currentNode) {
        break;
      }

      const step: ExecutionStep = {
        stepNumber,
        nodeType: currentNode.type,
        nodeLabel: currentNode.data?.label || currentNode.type,
        action: currentNode.type,
        status: "running",
        startedAt: new Date(),
      };

      try {
        // Execute the node based on its type
        const result = await executeNode(currentNode, context, workflow);

        step.status = result.success ? "completed" : "failed";
        step.completedAt = new Date();
        step.output = result.output;
        step.error = result.error;

        steps.push(step);

        // Find next node
        const nextEdge = edges.find((edge: any) => edge.source === currentNodeId);

        if (nextEdge) {
          currentNodeId = nextEdge.target;
          stepNumber++;
        } else {
          currentNodeId = null; // End of workflow
        }
      } catch (error) {
        step.status = "failed";
        step.completedAt = new Date();
        step.error = error instanceof Error ? error.message : "Unknown error";
        steps.push(step);
        throw error;
      }
    }

    // Update execution log as completed
    await updateDoc(doc(db, "execution_logs", executionLogRef.id), {
      status: "completed",
      completed_at: serverTimestamp(),
      duration: steps.reduce(
        (sum, step) =>
          sum +
          (step.completedAt && step.startedAt
            ? step.completedAt.getTime() - step.startedAt.getTime()
            : 0),
        0
      ),
      steps: steps.length,
      result: {
        steps,
        success: true,
      },
      updated_at: serverTimestamp(),
    });

    // Update workflow success count
    await updateDoc(doc(db, "workflows", workflow.id), {
      success_count: increment(1),
      last_executed: serverTimestamp(),
    });

    console.log(`✅ Workflow completed: ${workflow.name}`);

    return {
      success: true,
      executionId: executionLogRef.id,
    };
  } catch (error) {
    console.error(`❌ Workflow failed: ${workflow.name}`, error);

    // Update workflow error count
    if (workflow.id) {
      await updateDoc(doc(db, "workflows", workflow.id), {
        error_count: increment(1),
        last_executed: serverTimestamp(),
      });
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Execute a single workflow node
 */
async function executeNode(
  node: any,
  context: WorkflowExecutionContext,
  workflow: Workflow
): Promise<{ success: boolean; output?: any; error?: string }> {
  console.log(`  ⚙️ Executing node: ${node.type} - ${node.data?.label}`);

  try {
    switch (node.type) {
      case "trigger":
        // Trigger nodes don't execute, they just start the workflow
        return { success: true, output: "Trigger activated" };

      case "condition":
        // Evaluate condition
        return evaluateCondition(node, context);

      case "action":
        // Execute action (add tag, assign agent, etc.)
        return await executeAction(node, context);

      case "aiReply":
        // Generate and send AI reply
        return await executeAIReply(node, context, workflow);

      case "template":
        // Send template message
        return await executeSendTemplate(node, context);

      case "webhook":
        // Call external webhook
        return await executeWebhook(node, context);

      default:
        return {
          success: false,
          error: `Unknown node type: ${node.type}`,
        };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Evaluate a condition node
 */
function evaluateCondition(
  node: any,
  context: WorkflowExecutionContext
): { success: boolean; output?: any } {
  const conditionType = node.data?.label?.toLowerCase() || "";

  if (conditionType.includes("contains")) {
    const keyword = node.data?.keyword || "";
    const contains = context.messageContent?.toLowerCase().includes(keyword.toLowerCase()) ?? false;
    return { success: contains, output: `Message ${contains ? "contains" : "does not contain"} "${keyword}"` };
  }

  if (conditionType.includes("tag")) {
    const requiredTag = node.data?.tag || "";
    const hasTag = context.contactData?.tags.includes(requiredTag) ?? false;
    return { success: hasTag, output: `Contact ${hasTag ? "has" : "does not have"} tag "${requiredTag}"` };
  }

  // Default: pass condition
  return { success: true, output: "Condition passed" };
}

/**
 * Execute an action node
 */
async function executeAction(
  node: any,
  context: WorkflowExecutionContext
): Promise<{ success: boolean; output?: any }> {
  const actionType = node.data?.label?.toLowerCase() || "";

  if (actionType.includes("add tag")) {
    const tag = node.data?.tag || "workflow-tagged";
    // Add tag to contact
    const contactRef = doc(db, "contacts", context.contactId);
    await updateDoc(contactRef, {
      tags: [...(context.contactData?.tags || []), tag],
      updated_at: serverTimestamp(),
    });
    return { success: true, output: `Added tag: ${tag}` };
  }

  if (actionType.includes("assign")) {
    const agentId = node.data?.agentId || null;
    // Assign conversation to agent
    const conversationRef = doc(db, "conversations", context.conversationId);
    await updateDoc(conversationRef, {
      assigned_to: agentId,
      updated_at: serverTimestamp(),
    });
    return { success: true, output: `Assigned to agent: ${agentId}` };
  }

  if (actionType.includes("status")) {
    const status = node.data?.status || "open";
    // Update conversation status
    const conversationRef = doc(db, "conversations", context.conversationId);
    await updateDoc(conversationRef, {
      status,
      updated_at: serverTimestamp(),
    });
    return { success: true, output: `Updated status to: ${status}` };
  }

  return { success: true, output: "Action completed" };
}

/**
 * Execute AI reply node
 */
async function executeAIReply(
  node: any,
  context: WorkflowExecutionContext,
  workflow: Workflow
): Promise<{ success: boolean; output?: any; error?: string }> {
  if (!context.messageContent || !context.conversationHistory) {
    return { success: false, error: "No message content or conversation history" };
  }

  // Generate AI reply
  const result = await handleAIAutoReply({
    messageContent: context.messageContent,
    conversationHistory: context.conversationHistory,
    contactName: context.contactData?.name || "Customer",
    contactTags: context.contactData?.tags || [],
    systemPrompt: node.data?.systemPrompt || workflow.config?.aiPrompt,
  });

  if (!result.success || !result.reply) {
    return { success: false, error: result.error || "Failed to generate AI reply" };
  }

  // Send the reply via the appropriate channel
  let sendResult;

  if (context.channel === "whatsapp") {
    if (!context.contactData?.phone) {
      return { success: false, error: "No phone number for WhatsApp reply" };
    }
    sendResult = await sendWhatsAppTextMessage({
      to: context.contactData.phone,
      message: result.reply,
    });
  } else if (context.channel === "instagram") {
    if (!context.contactData?.instagram_id) {
      return { success: false, error: "No Instagram ID for Instagram reply" };
    }
    sendResult = await sendInstagramTextMessage({
      recipientId: context.contactData.instagram_id,
      message: result.reply,
    });
  } else {
    return { success: false, error: `Unsupported channel: ${context.channel}` };
  }

  // Save message to database
  await addDoc(collection(db, "messages"), {
    conversation_id: context.conversationId,
    contact_id: context.contactId,
    tenant_id: context.tenantId,
    sender_type: "ai",
    sender_name: "AI Assistant",
    content: result.reply,
    message_type: "text",
    channel: context.channel,
    status: sendResult.success ? "sent" : "failed",
    metadata: {
      workflow_id: workflow.id,
      tokens_used: result.tokensUsed,
      confidence: result.confidence,
    },
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });

  return {
    success: sendResult.success,
    output: {
      reply: result.reply,
      tokensUsed: result.tokensUsed,
      messageId: sendResult.messageId || sendResult.data?.message_id,
    },
  };
}

/**
 * Execute send template node
 */
async function executeSendTemplate(
  node: any,
  context: WorkflowExecutionContext
): Promise<{ success: boolean; output?: any; error?: string }> {
  const templateName = node.data?.templateName || "default_template";
  const message = node.data?.message || "This is a template message";

  // Send via the appropriate channel
  let sendResult;

  if (context.channel === "whatsapp") {
    if (!context.contactData?.phone) {
      return { success: false, error: "No phone number" };
    }
    sendResult = await sendWhatsAppTextMessage({
      to: context.contactData.phone,
      message,
    });
  } else if (context.channel === "instagram") {
    if (!context.contactData?.instagram_id) {
      return { success: false, error: "No Instagram ID" };
    }
    sendResult = await sendInstagramTextMessage({
      recipientId: context.contactData.instagram_id,
      message,
    });
  } else {
    return { success: false, error: `Unsupported channel: ${context.channel}` };
  }

  // Save message to database
  await addDoc(collection(db, "messages"), {
    conversation_id: context.conversationId,
    contact_id: context.contactId,
    tenant_id: context.tenantId,
    sender_type: "template",
    content: message,
    message_type: "text",
    channel: context.channel,
    status: sendResult.success ? "sent" : "failed",
    metadata: {
      template_name: templateName,
    },
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });

  return {
    success: sendResult.success,
    output: { templateName, messageId: sendResult.messageId || sendResult.data?.message_id },
  };
}

/**
 * Execute webhook node
 */
async function executeWebhook(
  node: any,
  context: WorkflowExecutionContext
): Promise<{ success: boolean; output?: any; error?: string }> {
  const webhookUrl = node.data?.url || "";

  if (!webhookUrl) {
    return { success: false, error: "No webhook URL configured" };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contact_id: context.contactId,
        conversation_id: context.conversationId,
        message_content: context.messageContent,
        channel: context.channel,
        contact_data: context.contactData,
      }),
    });

    const data = await response.json();

    return {
      success: response.ok,
      output: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Webhook call failed",
    };
  }
}

/**
 * Main function to trigger workflows on new message
 */
export async function triggerWorkflowsOnMessage(context: WorkflowExecutionContext): Promise<void> {
  console.log("🔔 Checking workflows for new message...");

  try {
    // Find workflows triggered by new messages
    const messageWorkflows = await findTriggeredWorkflows(
      context.tenantId,
      "new_message",
      context.messageContent
    );

    // Find workflows triggered by keyword match
    const keywordWorkflows = await findTriggeredWorkflows(
      context.tenantId,
      "keyword_match",
      context.messageContent
    );

    const allWorkflows = [...messageWorkflows, ...keywordWorkflows];

    if (allWorkflows.length === 0) {
      console.log("  No workflows found for this trigger");
      return;
    }

    console.log(`  Found ${allWorkflows.length} workflows to execute`);

    // Execute workflows in parallel
    const executions = allWorkflows.map((workflow) =>
      executeWorkflow(workflow, context)
    );

    const results = await Promise.allSettled(executions);

    for (let index = 0; index < results.length; index++) {
      const result = results[index];
      if (result.status === "fulfilled") {
        console.log(`  ✅ Workflow ${index + 1}/${allWorkflows.length}: Success`);
      } else {
        console.log(`  ❌ Workflow ${index + 1}/${allWorkflows.length}: Failed`);
      }
    }
  } catch (error) {
    console.error("Failed to trigger workflows:", error);
  }
}
