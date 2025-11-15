// types/channel.ts - Multi-channel messaging system types

// ============================================
// CHANNEL DEFINITIONS
// ============================================

export type Channel = 'whatsapp' | 'instagram';

export interface ChannelConfig {
  whatsapp?: {
    phone_number_id: string;
    business_account_id: string;
    access_token: string;
    webhook_verify_token: string;
  };
  instagram?: {
    instagram_business_account_id: string;
    page_id: string;
    access_token: string;
    webhook_verify_token: string;
  };
}

// ============================================
// CONTACT & CONVERSATION (Multi-Channel)
// ============================================

export interface Contact {
  id: string;
  tenant_id: string;
  channel: Channel;
  external_id: string; // Phone number (WhatsApp) or Instagram User ID
  display_name: string;
  profile_picture_url?: string;
  email?: string;
  tags: string[];
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  last_seen_at?: Date;
  
  // Channel-specific fields
  whatsapp?: {
    phone_number: string;
    wa_id: string;
  };
  instagram?: {
    username: string;
    ig_user_id: string;
  };
}

export interface Conversation {
  id: string;
  tenant_id: string;
  contact_id: string;
  channel: Channel;
  status: 'open' | 'closed' | 'archived';
  ai_paused: boolean; // Human handover
  unread_count: number;
  tags: string[];
  assigned_to?: string; // Team member ID
  last_message_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Message {
  id: string;
  conversation_id: string;
  tenant_id: string;
  channel: Channel;
  external_message_id: string; // WhatsApp/Instagram message ID
  direction: 'inbound' | 'outbound';
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'sticker';
  content: {
    text?: string;
    media_url?: string;
    media_type?: string;
    caption?: string;
  };
  status: 'sent' | 'delivered' | 'read' | 'failed';
  sender: {
    id: string;
    type: 'contact' | 'agent' | 'bot';
    name: string;
  };
  created_at: Date;
  raw_payload: Record<string, any>; // Original WhatsApp/Instagram payload
}

// ============================================
// INSTAGRAM-SPECIFIC TYPES
// ============================================

export interface InstagramWebhookPayload {
  object: 'instagram';
  entry: InstagramWebhookEntry[];
}

export interface InstagramWebhookEntry {
  id: string; // Page/IG Business Account ID
  time: number;
  messaging?: InstagramMessaging[];
}

export interface InstagramMessaging {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: {
    mid: string;
    text?: string;
    attachments?: Array<{
      type: 'image' | 'video' | 'audio';
      payload: { url: string };
    }>;
    is_echo?: boolean;
    reply_to?: { mid: string };
  };
  postback?: {
    mid: string;
    title: string;
    payload: string;
  };
}

export interface InstagramUser {
  id: string;
  username?: string;
  name?: string;
  profile_pic?: string;
}

export interface InstagramSendMessageRequest {
  recipient: { id: string };
  message: {
    text?: string;
    attachment?: {
      type: 'image' | 'video' | 'audio' | 'file';
      payload: { url: string };
    };
  };
  messaging_type: 'RESPONSE' | 'UPDATE' | 'MESSAGE_TAG';
  tag?: string;
}

// ============================================
// WHATSAPP-SPECIFIC TYPES (Enhanced)
// ============================================

export interface WhatsAppWebhookPayload {
  object: 'whatsapp_business_account';
  entry: WhatsAppWebhookEntry[];
}

export interface WhatsAppWebhookEntry {
  id: string;
  changes: Array<{
    value: {
      messaging_product: 'whatsapp';
      metadata: {
        display_phone_number: string;
        phone_number_id: string;
      };
      contacts?: Array<{
        profile: { name: string };
        wa_id: string;
      }>;
      messages?: Array<{
        from: string;
        id: string;
        timestamp: string;
        type: 'text' | 'image' | 'video' | 'audio' | 'document';
        text?: { body: string };
        image?: { id: string; mime_type: string; sha256: string };
      }>;
      statuses?: Array<{
        id: string;
        status: 'sent' | 'delivered' | 'read' | 'failed';
        timestamp: string;
      }>;
    };
    field: string;
  }>;
}

export interface WhatsAppSendMessageRequest {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string; // Phone number
  type: 'text' | 'image' | 'template';
  text?: { body: string; preview_url?: boolean };
  image?: { link: string; caption?: string };
  template?: {
    name: string;
    language: { code: string };
    components?: Array<{
      type: 'body' | 'button';
      parameters: Array<{ type: 'text'; text: string }>;
    }>;
  };
}

// ============================================
// UNIFIED MESSAGE CLIENT INTERFACE
// ============================================

export interface MessageClient {
  sendMessage(params: SendMessageParams): Promise<SendMessageResponse>;
  getUser(externalId: string): Promise<Contact>;
}

export interface SendMessageParams {
  channel: Channel;
  to: string; // Phone number or Instagram user ID
  content: {
    type: 'text' | 'image' | 'video' | 'audio';
    text?: string;
    media_url?: string;
    caption?: string;
  };
  tenant: {
    id: string;
    channelConfig: ChannelConfig;
  };
}

export interface SendMessageResponse {
  success: boolean;
  message_id?: string;
  error?: string;
}

// ============================================
// USER-SIDE EXPERIENCE FLOWS
// ============================================

export type UserFlowType =
  | 'greeting'
  | 'faq'
  | 'lead_capture'
  | 'order_status'
  | 'after_hours'
  | 'human_handover'
  | 'feedback'
  | 'opt_out';

export interface UserFlowTemplate {
  type: UserFlowType;
  channel: Channel | 'both';
  trigger_keywords: string[];
  messages: {
    initial?: string;
    follow_up?: string;
    success?: string;
    error?: string;
  };
  requires_human?: boolean;
  variables?: Record<string, any>;
}

// ============================================
// BUSINESS HOURS & OOO (Out-of-Office)
// ============================================

export interface BusinessHours {
  enabled: boolean;
  timezone: string;
  schedule: {
    monday: { enabled: boolean; start: string; end: string };
    tuesday: { enabled: boolean; start: string; end: string };
    wednesday: { enabled: boolean; start: string; end: string };
    thursday: { enabled: boolean; start: string; end: string };
    friday: { enabled: boolean; start: string; end: string };
    saturday: { enabled: boolean; start: string; end: string };
    sunday: { enabled: boolean; start: string; end: string };
  };
  out_of_hours_message: string;
  out_of_hours_behavior: 'auto_reply' | 'queue_for_human' | 'silent';
}

export function isInBusinessHours(businessHours: BusinessHours, date: Date = new Date()): boolean {
  if (!businessHours.enabled) return true;
  
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = days[date.getDay()] as keyof typeof businessHours.schedule;
  const dayConfig = businessHours.schedule[dayName];
  
  if (!dayConfig.enabled) return false;
  
  const currentTime = date.toLocaleTimeString('en-US', { hour12: false, timeZone: businessHours.timezone });
  return currentTime >= dayConfig.start && currentTime <= dayConfig.end;
}
