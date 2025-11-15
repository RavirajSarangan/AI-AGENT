// types/visual-workflow.ts - n8n-style visual workflow builder types

import { Channel } from './channel';

// ============================================
// VISUAL WORKFLOW CANVAS TYPES
// ============================================

export interface VisualWorkflow {
  id: string;
  name: string;
  description?: string;
  tenant_id: string;
  status: 'active' | 'inactive' | 'draft';
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  canvas_state: {
    zoom: number;
    pan_x: number;
    pan_y: number;
  };
  created_at: Date;
  updated_at: Date;
  execution_count: number;
  success_count: number;
  error_count: number;
  last_executed_at?: Date;
}

// ============================================
// NODE DEFINITIONS (Visual Graph Nodes)
// ============================================

export interface WorkflowNode {
  id: string; // Unique node ID (e.g., "node_abc123")
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;
  name: string; // User-defined name (e.g., "Check if asking about price")
}

export type NodeType =
  | 'trigger'
  | 'condition'
  | 'ai_reply'
  | 'ai_extract'
  | 'send_message'
  | 'http_request'
  | 'tag_contact'
  | 'tag_conversation'
  | 'wait'
  | 'switch'
  | 'set_variable'
  | 'end';

export type NodeData =
  | TriggerNodeData
  | ConditionNodeData
  | AIReplyNodeData
  | AIExtractNodeData
  | SendMessageNodeData
  | HTTPRequestNodeData
  | TagNodeData
  | WaitNodeData
  | SwitchNodeData
  | SetVariableNodeData
  | EndNodeData;

// ============================================
// TRIGGER NODE
// ============================================

export interface TriggerNodeData {
  type: 'trigger';
  trigger_type: 'incoming_message' | 'incoming_webhook';
  channels: Channel[]; // ['whatsapp', 'instagram']
  filters?: {
    only_new_conversations?: boolean;
    contact_tags?: string[];
    keywords?: string[];
    business_hours_only?: boolean;
  };
}

// ============================================
// CONDITION NODE (IF/ELSE)
// ============================================

export interface ConditionNodeData {
  type: 'condition';
  conditions: Array<{
    field: string; // e.g., "message.text", "contact.tags", "channel"
    operator: 'contains' | 'equals' | 'not_equals' | 'matches_regex' | 'has_tag' | 'is_channel';
    value: string | string[];
    case_sensitive?: boolean;
  }>;
  logic: 'AND' | 'OR'; // How to combine multiple conditions
  outputs: {
    true: string; // Node ID to go to if true
    false: string; // Node ID to go to if false
  };
}

// ============================================
// SWITCH NODE (Multi-branch)
// ============================================

export interface SwitchNodeData {
  type: 'switch';
  field: string; // e.g., "{{message.text}}"
  cases: Array<{
    id: string;
    label: string;
    condition: string; // e.g., "contains:price", "equals:help"
    output: string; // Node ID to go to
  }>;
  default_output?: string; // Node ID for default case
}

// ============================================
// AI REPLY NODE
// ============================================

export interface AIReplyNodeData {
  type: 'ai_reply';
  prompt_template: string; // With variables like {{message.text}}, {{contact.name}}
  tone: 'friendly' | 'professional' | 'sales' | 'support' | 'neutral' | 'custom';
  custom_tone?: string;
  max_tokens?: number;
  temperature?: number;
  output_variable: string; // e.g., "ai_reply"
  model?: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3-sonnet';
}

// ============================================
// AI EXTRACT NODE (Extract data from text)
// ============================================

export interface AIExtractNodeData {
  type: 'ai_extract';
  input_text: string; // e.g., "{{message.text}}"
  extract_fields: Array<{
    name: string; // e.g., "order_number", "email", "name"
    description: string; // What to extract
    type: 'text' | 'number' | 'email' | 'phone' | 'date';
  }>;
  output_variable: string; // e.g., "extracted_data"
}

// ============================================
// SEND MESSAGE NODE
// ============================================

export interface SendMessageNodeData {
  type: 'send_message';
  channel_mode: 'same_as_trigger' | 'force_whatsapp' | 'force_instagram';
  message_source: 'ai_output' | 'custom_template';
  ai_output_variable?: string; // e.g., "{{ai_reply}}"
  custom_message?: string; // Template with variables
  buttons?: Array<{
    type: 'quick_reply' | 'url';
    text: string;
    payload?: string; // For quick reply
    url?: string; // For URL button
  }>;
  mark_as_answered?: boolean;
}

// ============================================
// HTTP REQUEST NODE
// ============================================

export interface HTTPRequestNodeData {
  type: 'http_request';
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string; // Can include variables
  headers?: Record<string, string>;
  body?: string; // JSON string with variables
  timeout_ms?: number;
  retry_count?: number;
  save_response_to?: string; // Variable name, e.g., "crm_response"
  outputs: {
    success: string; // Node ID if success
    error: string; // Node ID if error
  };
}

// ============================================
// TAG NODE
// ============================================

export interface TagNodeData {
  type: 'tag_contact' | 'tag_conversation';
  action: 'add' | 'remove';
  tags: string[];
}

// ============================================
// WAIT/DELAY NODE
// ============================================

export interface WaitNodeData {
  type: 'wait';
  duration_ms: number;
  reason?: string; // For documentation
}

// ============================================
// SET VARIABLE NODE
// ============================================

export interface SetVariableNodeData {
  type: 'set_variable';
  variables: Record<string, string>; // key: value with variable support
}

// ============================================
// END NODE
// ============================================

export interface EndNodeData {
  type: 'end';
  reason?: string; // For logging
}

// ============================================
// CONNECTIONS (Edges between nodes)
// ============================================

export interface WorkflowConnection {
  id: string;
  source_node_id: string;
  source_output: string; // e.g., "true", "false", "success", "error", "default"
  target_node_id: string;
  label?: string; // Visual label on the connection
  color?: 'green' | 'red' | 'gray' | 'blue';
}

// ============================================
// NODE LIBRARY CATEGORIES
// ============================================

export interface NodeLibraryCategory {
  id: string;
  name: string;
  icon: string;
  nodes: NodeLibraryItem[];
}

export interface NodeLibraryItem {
  type: NodeType;
  name: string;
  description: string;
  icon: string;
  category: 'triggers' | 'logic' | 'ai' | 'messaging' | 'data' | 'control';
  default_config: Partial<NodeData>;
}

export const NODE_LIBRARY: NodeLibraryCategory[] = [
  {
    id: 'triggers',
    name: 'Triggers',
    icon: 'Zap',
    nodes: [
      {
        type: 'trigger',
        name: 'Incoming Message',
        description: 'Triggered when a message arrives on WhatsApp or Instagram',
        icon: 'MessageCircle',
        category: 'triggers',
        default_config: {
          type: 'trigger',
          trigger_type: 'incoming_message',
          channels: ['whatsapp', 'instagram'],
        },
      },
    ],
  },
  {
    id: 'logic',
    name: 'Logic',
    icon: 'GitBranch',
    nodes: [
      {
        type: 'condition',
        name: 'Condition',
        description: 'Branch based on if/else logic',
        icon: 'GitBranch',
        category: 'logic',
        default_config: {
          type: 'condition',
          conditions: [
            {
              field: 'message.text',
              operator: 'contains',
              value: '',
            },
          ],
          logic: 'AND',
          outputs: { true: '', false: '' },
        },
      },
      {
        type: 'switch',
        name: 'Switch',
        description: 'Multi-branch logic based on a value',
        icon: 'ListTree',
        category: 'logic',
        default_config: {
          type: 'switch',
          field: '{{message.text}}',
          cases: [],
        },
      },
    ],
  },
  {
    id: 'ai',
    name: 'AI',
    icon: 'Sparkles',
    nodes: [
      {
        type: 'ai_reply',
        name: 'AI Reply',
        description: 'Generate a response using AI',
        icon: 'Sparkles',
        category: 'ai',
        default_config: {
          type: 'ai_reply',
          prompt_template: 'You are a helpful assistant. Reply to: {{message.text}}',
          tone: 'friendly',
          output_variable: 'ai_reply',
          temperature: 0.7,
        },
      },
      {
        type: 'ai_extract',
        name: 'AI Extract',
        description: 'Extract structured data from text',
        icon: 'ScanText',
        category: 'ai',
        default_config: {
          type: 'ai_extract',
          input_text: '{{message.text}}',
          extract_fields: [],
          output_variable: 'extracted_data',
        },
      },
    ],
  },
  {
    id: 'messaging',
    name: 'Messaging',
    icon: 'Send',
    nodes: [
      {
        type: 'send_message',
        name: 'Send Message',
        description: 'Send a message to the user',
        icon: 'Send',
        category: 'messaging',
        default_config: {
          type: 'send_message',
          channel_mode: 'same_as_trigger',
          message_source: 'ai_output',
          ai_output_variable: '{{ai_reply}}',
        },
      },
    ],
  },
  {
    id: 'data',
    name: 'Data & Integrations',
    icon: 'Database',
    nodes: [
      {
        type: 'http_request',
        name: 'HTTP Request',
        description: 'Call an external API',
        icon: 'Globe',
        category: 'data',
        default_config: {
          type: 'http_request',
          method: 'POST',
          url: '',
          outputs: { success: '', error: '' },
        },
      },
      {
        type: 'tag_contact',
        name: 'Tag Contact',
        description: 'Add or remove tags from contact',
        icon: 'Tag',
        category: 'data',
        default_config: {
          type: 'tag_contact',
          action: 'add',
          tags: [],
        },
      },
      {
        type: 'tag_conversation',
        name: 'Tag Conversation',
        description: 'Add or remove tags from conversation',
        icon: 'Tags',
        category: 'data',
        default_config: {
          type: 'tag_conversation',
          action: 'add',
          tags: [],
        },
      },
      {
        type: 'set_variable',
        name: 'Set Variable',
        description: 'Set custom variables',
        icon: 'Variable',
        category: 'data',
        default_config: {
          type: 'set_variable',
          variables: {},
        },
      },
    ],
  },
  {
    id: 'control',
    name: 'Control',
    icon: 'CircleStop',
    nodes: [
      {
        type: 'wait',
        name: 'Wait',
        description: 'Pause execution for a duration',
        icon: 'Clock',
        category: 'control',
        default_config: {
          type: 'wait',
          duration_ms: 1000,
        },
      },
      {
        type: 'end',
        name: 'End',
        description: 'End the workflow',
        icon: 'CircleStop',
        category: 'control',
        default_config: {
          type: 'end',
        },
      },
    ],
  },
];

// ============================================
// WORKFLOW VARIABLES (Available in templates)
// ============================================

export interface WorkflowVariables {
  message: {
    id: string;
    text: string;
    type: 'text' | 'image' | 'video' | 'audio';
    media_url?: string;
    timestamp: Date;
  };
  contact: {
    id: string;
    name: string;
    phone?: string;
    instagram_username?: string;
    email?: string;
    tags: string[];
  };
  conversation: {
    id: string;
    status: string;
    tags: string[];
    unread_count: number;
  };
  channel: Channel;
  tenant: {
    id: string;
    business_name: string;
    timezone: string;
  };
  // Runtime variables set by nodes
  [key: string]: any;
}

// ============================================
// EXECUTION STATE (For visual testing/debugging)
// ============================================

export interface WorkflowExecutionState {
  workflow_id: string;
  execution_id: string;
  status: 'running' | 'success' | 'error';
  current_node_id?: string;
  node_results: Map<string, NodeExecutionResult>;
  variables: WorkflowVariables;
  started_at: Date;
  finished_at?: Date;
}

export interface NodeExecutionResult {
  node_id: string;
  status: 'success' | 'error' | 'skipped' | 'running';
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  started_at: Date;
  finished_at?: Date;
  duration_ms?: number;
}

// ============================================
// VALIDATION
// ============================================

export interface WorkflowValidationResult {
  valid: boolean;
  errors: WorkflowValidationError[];
  warnings: WorkflowValidationWarning[];
}

export interface WorkflowValidationError {
  node_id?: string;
  message: string;
  field?: string;
}

export interface WorkflowValidationWarning {
  node_id?: string;
  message: string;
}

export function validateWorkflow(workflow: VisualWorkflow): WorkflowValidationResult {
  const errors: WorkflowValidationError[] = [];
  const warnings: WorkflowValidationWarning[] = [];

  // Must have at least one trigger
  const triggers = workflow.nodes.filter(n => n.type === 'trigger');
  if (triggers.length === 0) {
    errors.push({ message: 'Workflow must have at least one trigger' });
  }
  if (triggers.length > 1) {
    warnings.push({ message: 'Multiple triggers detected - only one will be used' });
  }

  // Check for orphaned nodes (not connected to trigger)
  const triggerNode = triggers[0];
  if (triggerNode) {
    const reachableNodes = new Set<string>([triggerNode.id]);
    const queue = [triggerNode.id];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const outgoingConnections = workflow.connections.filter(c => c.source_node_id === currentId);
      
      for (const conn of outgoingConnections) {
        if (!reachableNodes.has(conn.target_node_id)) {
          reachableNodes.add(conn.target_node_id);
          queue.push(conn.target_node_id);
        }
      }
    }

    const orphanedNodes = workflow.nodes.filter(n => !reachableNodes.has(n.id) && n.type !== 'trigger');
    if (orphanedNodes.length > 0) {
      warnings.push({
        message: `${orphanedNodes.length} node(s) not connected to trigger and will never execute`,
      });
    }
  }

  // Validate each node's configuration
  for (const node of workflow.nodes) {
    const nodeErrors = validateNodeData(node);
    errors.push(...nodeErrors);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

function validateNodeData(node: WorkflowNode): WorkflowValidationError[] {
  const errors: WorkflowValidationError[] = [];

  switch (node.data.type) {
    case 'condition':
      if (node.data.conditions.length === 0) {
        errors.push({ node_id: node.id, message: 'Condition node must have at least one condition', field: 'conditions' });
      }
      break;

    case 'ai_reply':
      if (!node.data.prompt_template || node.data.prompt_template.trim() === '') {
        errors.push({ node_id: node.id, message: 'AI Reply node must have a prompt template', field: 'prompt_template' });
      }
      if (!node.data.output_variable || node.data.output_variable.trim() === '') {
        errors.push({ node_id: node.id, message: 'AI Reply node must have an output variable name', field: 'output_variable' });
      }
      break;

    case 'send_message':
      if (node.data.message_source === 'ai_output' && !node.data.ai_output_variable) {
        errors.push({ node_id: node.id, message: 'Send Message node must specify AI output variable', field: 'ai_output_variable' });
      }
      if (node.data.message_source === 'custom_template' && !node.data.custom_message) {
        errors.push({ node_id: node.id, message: 'Send Message node must have custom message text', field: 'custom_message' });
      }
      break;

    case 'http_request':
      if (!node.data.url || node.data.url.trim() === '') {
        errors.push({ node_id: node.id, message: 'HTTP Request node must have a URL', field: 'url' });
      }
      break;

    case 'tag_contact':
    case 'tag_conversation':
      if (!node.data.tags || node.data.tags.length === 0) {
        errors.push({ node_id: node.id, message: 'Tag node must have at least one tag', field: 'tags' });
      }
      break;
  }

  return errors;
}
