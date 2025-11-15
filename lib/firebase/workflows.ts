import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface WorkflowNode {
  id: string;
  type: "trigger" | "condition" | "ai_reply" | "send_message" | "http_request" | "tag";
  position: { x: number; y: number };
  data: any;
  name: string;
}

export interface WorkflowConnection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  tenant_id: string;
  status: "active" | "inactive" | "draft";
  is_active?: boolean;
  trigger_type?: string;
  config?: any;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  canvas_state: {
    zoom: number;
    pan_x: number;
    pan_y: number;
  };
  created_at: Date | Timestamp;
  updated_at: Date | Timestamp;
  execution_count: number;
  success_count: number;
  error_count: number;
  last_executed_at?: Date | Timestamp;
}

// Real-time listener for all workflows
export const subscribeToWorkflows = (
  tenantId: string,
  callback: (workflows: Workflow[]) => void
) => {
  const q = query(
    collection(db, "workflows"),
    where("tenant_id", "==", tenantId),
    orderBy("updated_at", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const workflows = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate(),
      updated_at: doc.data().updated_at?.toDate(),
      last_executed_at: doc.data().last_executed_at?.toDate(),
    })) as Workflow[];
    callback(workflows);
  });
};

// Real-time listener for single workflow
export const subscribeToWorkflow = (
  workflowId: string,
  callback: (workflow: Workflow | null) => void
) => {
  const docRef = doc(db, "workflows", workflowId);

  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      callback({
        id: snapshot.id,
        ...data,
        created_at: data.created_at?.toDate(),
        updated_at: data.updated_at?.toDate(),
        last_executed_at: data.last_executed_at?.toDate(),
      } as Workflow);
    } else {
      callback(null);
    }
  });
};

// Create workflow
export const createWorkflow = async (
  workflow: Omit<Workflow, "id" | "created_at" | "updated_at">
) => {
  const docRef = await addDoc(collection(db, "workflows"), {
    ...workflow,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  return docRef.id;
};

// Update workflow
export const updateWorkflow = async (
  workflowId: string,
  updates: Partial<Workflow>
) => {
  const docRef = doc(db, "workflows", workflowId);
  await updateDoc(docRef, {
    ...updates,
    updated_at: serverTimestamp(),
  });
};

// Delete workflow
export const deleteWorkflow = async (workflowId: string) => {
  const docRef = doc(db, "workflows", workflowId);
  await deleteDoc(docRef);
};

// Get workflow by ID (one-time fetch)
export const getWorkflow = async (workflowId: string) => {
  const docRef = doc(db, "workflows", workflowId);
  const snapshot = await getDoc(docRef);
  
  if (snapshot.exists()) {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      ...data,
      created_at: data.created_at?.toDate(),
      updated_at: data.updated_at?.toDate(),
      last_executed_at: data.last_executed_at?.toDate(),
    } as Workflow;
  }
  return null;
};

// Toggle workflow status
export const toggleWorkflowStatus = async (workflowId: string) => {
  const workflow = await getWorkflow(workflowId);
  if (workflow) {
    await updateWorkflow(workflowId, {
      status: workflow.status === "active" ? "inactive" : "active",
    });
  }
};

// Increment execution counters
export const incrementWorkflowExecution = async (
  workflowId: string,
  success: boolean
) => {
  const workflow = await getWorkflow(workflowId);
  if (workflow) {
    await updateWorkflow(workflowId, {
      execution_count: workflow.execution_count + 1,
      success_count: success
        ? workflow.success_count + 1
        : workflow.success_count,
      error_count: success ? workflow.error_count : workflow.error_count + 1,
      last_executed_at: serverTimestamp() as any,
    });
  }
};
