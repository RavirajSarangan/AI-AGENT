// Workflow Execution & Logging Types

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  workflow_name: string;
  tenant_id: string;
  status: "success" | "error" | "running";
  trigger_type: "incoming_message" | "webhook" | "schedule";
  trigger_source: "whatsapp" | "api" | "manual";
  trigger_payload: {
    message_id?: string;
    contact_id?: string;
    contact_name?: string;
    contact_phone?: string;
    message_text?: string;
    webhook_data?: Record<string, any>;
  };
  started_at: Date;
  finished_at?: Date;
  duration_ms?: number;
  error_message?: string;
  conversation_id?: string;
  contact_id?: string;
  steps: WorkflowStepLog[];
}

export interface WorkflowStepLog {
  id: string;
  node_id: string;
  step_name: string;
  step_number: number;
  type: "trigger" | "condition" | "ai" | "send_message" | "http_request" | "tag";
  status: "success" | "error" | "skipped" | "running";
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  started_at: Date;
  finished_at?: Date;
  duration_ms?: number;
}

// Workflow Configuration Types

export interface WorkflowConfig {
  id: string;
  name: string;
  description?: string;
  tenant_id: string;
  status: "active" | "inactive" | "draft";
  trigger: WorkflowTrigger;
  nodes: WorkflowNode[];
  created_at: Date;
  updated_at: Date;
  created_by: string;
  last_execution?: Date;
  execution_count: number;
  success_count: number;
  error_count: number;
}

export interface WorkflowTrigger {
  type: "incoming_message" | "webhook" | "schedule";
  filters?: {
    all_messages?: boolean;
    new_conversations_only?: boolean;
    contact_tags?: string[];
    business_hours_only?: boolean;
    message_contains?: string;
  };
}

export type WorkflowNode =
  | ConditionNode
  | AINode
  | SendMessageNode
  | HTTPRequestNode
  | TagNode;

export interface BaseNode {
  id: string;
  type: "condition" | "ai" | "send_message" | "http_request" | "tag";
  name: string;
  description?: string;
  order: number;
}

export interface ConditionNode extends BaseNode {
  type: "condition";
  config: {
    field: "message.text" | "contact.tag" | "time" | "contact.name";
    operator: "contains" | "equals" | "regex" | "not_contains" | "not_equals";
    value: string;
    case_sensitive: boolean;
    on_false: "stop" | "skip" | "jump_to";
    jump_to_node_id?: string;
  };
}

export interface AINode extends BaseNode {
  type: "ai";
  config: {
    prompt_template: string;
    tone: "friendly_support" | "sales" | "neutral" | "custom";
    max_tokens: number;
    temperature: number;
    output_variable: string;
    use_conversation_history: boolean;
  };
}

export interface SendMessageNode extends BaseNode {
  type: "send_message";
  config: {
    mode: "ai_output" | "custom";
    ai_node_id?: string;
    custom_message?: string;
    variables_used: string[];
    mark_as_answered: boolean;
    close_conversation: boolean;
  };
}

export interface HTTPRequestNode extends BaseNode {
  type: "http_request";
  config: {
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    url: string;
    headers: Record<string, string>;
    body?: string;
    timeout_ms: number;
    retries: number;
    save_response: boolean;
    output_variable?: string;
  };
}

export interface TagNode extends BaseNode {
  type: "tag";
  config: {
    target: "contact" | "conversation";
    tags: string[];
    action: "add" | "remove";
  };
}

// Variables available in workflows
export interface WorkflowVariables {
  message: {
    text: string;
    id: string;
    timestamp: Date;
  };
  contact: {
    id: string;
    name?: string;
    phone: string;
    tags: string[];
    first_seen: Date;
  };
  conversation: {
    id: string;
    status: string;
    message_count: number;
    previous_messages?: string[];
  };
  tenant: {
    business_name: string;
    timezone: string;
  };
  // Dynamic variables from AI and HTTP nodes
  [key: string]: any;
}

// Workflow Test Types
export interface WorkflowTestInput {
  workflow_id: string;
  sample_message: string;
  sample_contact?: {
    name: string;
    phone: string;
    tags: string[];
  };
  dry_run: boolean; // If true, don't actually send WhatsApp or make real HTTP calls
}

export interface WorkflowTestResult {
  success: boolean;
  execution_id: string;
  steps: Array<{
    node_id: string;
    name: string;
    type: string;
    status: "success" | "error" | "skipped";
    input: any;
    output: any;
    error?: string;
    duration_ms: number;
  }>;
  total_duration_ms: number;
  error?: string;
}
