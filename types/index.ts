// Core entity types

export interface User {
  id: string;
  email: string;
  name: string;
  role: "owner" | "admin" | "agent";
  tenantId: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tenant {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  timezone: string;
  plan: "starter" | "pro" | "agency";
  whatsappNumber?: string;
  whatsappConfig?: WhatsAppConfig;
  aiConfig?: AIConfig;
  businessHours?: BusinessHours;
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  webhookVerifyToken: string;
  businessAccountId: string;
}

export interface AIConfig {
  systemPrompt: string;
  tone: "friendly" | "formal" | "fun";
  temperature: number;
  maxTokens: number;
  useConversationHistory: boolean;
  fallbackMessage: string;
}

export interface BusinessHours {
  enabled: boolean;
  timezone: string;
  schedule: {
    [key: string]: { start: string; end: string; enabled: boolean };
  };
  outOfHoursMessage: string;
}

export interface Contact {
  id: string;
  tenantId: string;
  whatsappNumber: string;
  name?: string;
  email?: string;
  tags: string[];
  notes?: string;
  metadata?: Record<string, any>;
  firstSeen: Date;
  lastSeen: Date;
  conversationCount: number;
}

export interface Conversation {
  id: string;
  tenantId: string;
  contactId: string;
  status: "open" | "closed";
  tags: string[];
  assignedTo?: string;
  notes?: string;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  autoReplyPaused: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  direction: "inbound" | "outbound";
  text: string;
  mediaUrl?: string;
  mediaType?: string;
  status: "sent" | "delivered" | "read" | "failed";
  handledBy?: "workflow" | "manual" | "ai";
  workflowId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Workflow types

export type WorkflowTriggerType = "incoming_message" | "incoming_webhook" | "scheduled";

export type WorkflowNodeType =
  | "condition"
  | "ai"
  | "send_whatsapp"
  | "http_request"
  | "delay"
  | "set_variable"
  | "tag_contact"
  | "webhook";

export interface Workflow {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  enabled: boolean;
  trigger: WorkflowTrigger;
  nodes: WorkflowNode[];
  version: number;
  lastRunAt?: Date;
  totalRuns: number;
  successRate: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface WorkflowTrigger {
  type: WorkflowTriggerType;
  config: Record<string, any>;
}

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  position: { x: number; y: number };
  config: Record<string, any>;
  nextOnSuccess?: string;
  nextOnFailure?: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  tenantId: string;
  status: "success" | "failed" | "running";
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  triggerData: Record<string, any>;
  steps: WorkflowExecutionStep[];
  error?: string;
  conversationId?: string;
  contactId?: string;
}

export interface WorkflowExecutionStep {
  nodeId: string;
  nodeType: WorkflowNodeType;
  status: "success" | "failed" | "skipped";
  startedAt: Date;
  completedAt: Date;
  input: Record<string, any>;
  output: Record<string, any>;
  error?: string;
}

// Dashboard & Analytics types

export interface DashboardStats {
  totalConversations: number;
  messagesThisWeek: number;
  autoReplyRate: number;
  avgResponseTime: number;
  activeWorkflows: number;
  workflowSuccessRate: number;
}

export interface ConversationMetrics {
  date: string;
  total: number;
  auto: number;
  manual: number;
}

export interface WorkflowMetrics {
  workflowId: string;
  workflowName: string;
  executions: number;
  successRate: number;
  avgDuration: number;
}

// Billing types

export interface BillingInfo {
  tenantId: string;
  plan: "starter" | "pro" | "agency";
  status: "active" | "cancelled" | "past_due";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  usage: {
    messages: number;
    workflowExecutions: number;
    whatsappNumbers: number;
  };
  limits: {
    messages: number;
    workflowExecutions: number;
    whatsappNumbers: number;
  };
  paymentMethod?: {
    type: string;
    last4: string;
    expiryMonth: number;
    expiryYear: number;
  };
}

// Form types for validation

export interface LoginForm {
  email: string;
  password: string;
}

export interface SignUpForm {
  name: string;
  email: string;
  password: string;
  companyName: string;
}

export interface ForgotPasswordForm {
  email: string;
}

export interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}
