// lib/user-flows.ts - User-side WhatsApp/Instagram experience flows

import { UserFlowType, UserFlowTemplate } from '@/types/channel';

/**
 * Pre-defined user experience flows for WhatsApp and Instagram
 * These templates define how the bot interacts with end users
 */

export const USER_FLOWS: Record<UserFlowType, UserFlowTemplate> = {
  // 1️⃣ GREETING FLOW - First Contact
  greeting: {
    type: 'greeting',
    channel: 'both',
    trigger_keywords: ['hi', 'hello', 'hey', 'start'],
    messages: {
      initial: `Hi {{contact.name}}! 👋

I'm the virtual assistant for {{tenant.business_name}}.

I can help you with:
1️⃣ Prices and plans
2️⃣ Support for an order
3️⃣ Talk to a human

Just reply with **1, 2 or 3**.`,
      follow_up: 'What would you like to know about today?',
    },
    requires_human: false,
  },

  // 2️⃣ FAQ FLOW - General Questions
  faq: {
    type: 'faq',
    channel: 'both',
    trigger_keywords: [
      'price',
      'pricing',
      'cost',
      'how much',
      'plans',
      'features',
      'what do you offer',
      'services',
      'hours',
      'location',
      'shipping',
      'delivery',
      'refund',
      'return',
      'policy',
    ],
    messages: {
      initial: `{{ai_response}}

Would you like:
1️⃣ More details
2️⃣ Talk to sales
3️⃣ Something else`,
      success: 'Glad I could help! Anything else?',
    },
    requires_human: false,
    variables: {
      ai_prompt: `You are a friendly customer service assistant for {{tenant.business_name}}.
The user asked: "{{message.text}}"

Provide a helpful, concise answer (2-3 sentences max).
Be warm and professional. If you're not certain, say so and offer to connect them with a human.`,
    },
  },

  // 3️⃣ LEAD CAPTURE FLOW
  lead_capture: {
    type: 'lead_capture',
    channel: 'both',
    trigger_keywords: [
      'buy',
      'purchase',
      'sign up',
      'interested',
      'want to order',
      'get started',
      'demo',
      'trial',
    ],
    messages: {
      initial: `That's awesome! 🎉

To help you better, can you share:
• Your name
• Company name (if applicable)
• Email address

You can send them in one message like:
"John, Acme Corp, john@example.com"`,
      success: `Thanks {{contact.name}}! 🙌

I've shared your info with our team.
A salesperson will reach out to you shortly with a custom offer.

In the meantime, would you like a quick overview of our plans?`,
      error: `I didn't quite catch that. Could you share your details in this format?

Name, Company, Email

Example: John Smith, Acme Inc, john@acme.com`,
    },
    requires_human: false,
    variables: {
      extract_fields: ['name', 'company', 'email'],
      crm_webhook: '{{tenant.crm_webhook_url}}',
    },
  },

  // 4️⃣ ORDER STATUS FLOW
  order_status: {
    type: 'order_status',
    channel: 'both',
    trigger_keywords: [
      'order',
      'status',
      'track',
      'tracking',
      'where is my',
      'delivery',
      'shipped',
    ],
    messages: {
      initial: `I can help with that! ✅

Please confirm your order number (e.g., 12345).`,
      success: `Your order **#{{order_number}}** is currently:
**{{order_status}}** {{order_icon}}

{{order_details}}

Anything else I can help you with?`,
      error: `Hmm, I couldn't find order **#{{order_number}}**. 😕

Can you check if the number is correct or send a screenshot of your order confirmation?`,
    },
    requires_human: false,
    variables: {
      order_api_url: '{{tenant.order_api_url}}',
    },
  },

  // 5️⃣ AFTER-HOURS / OUT-OF-OFFICE FLOW
  after_hours: {
    type: 'after_hours',
    channel: 'both',
    trigger_keywords: [],
    messages: {
      initial: `Thanks for reaching out! 🌙

Our team is currently offline (we're available {{business_hours}}).

I can give you quick automated answers now, or the team will reply after we're back online.

You can:
1️⃣ Ask a quick question (AI)
2️⃣ Leave a message for the team`,
      success: `Your message has been recorded. Our team will get back to you during business hours.`,
    },
    requires_human: true,
  },

  // 6️⃣ HUMAN HANDOVER / ESCALATION FLOW
  human_handover: {
    type: 'human_handover',
    channel: 'both',
    trigger_keywords: [
      'human',
      'agent',
      'person',
      'talk to someone',
      'representative',
      'support',
      'help',
      'speak',
      'real person',
    ],
    messages: {
      initial: `No problem! 👍

I'll hand you over to a human teammate.
They'll reply here as soon as possible.

In the meantime, can you briefly explain what you need help with?`,
      success: `✅ Your request has been noted.

A team member will respond shortly. Thanks for your patience!`,
    },
    requires_human: true,
    variables: {
      notification_channels: ['email', 'slack'],
    },
  },

  // 7️⃣ FEEDBACK / RATING FLOW
  feedback: {
    type: 'feedback',
    channel: 'both',
    trigger_keywords: [],
    messages: {
      initial: `Thanks for chatting with us today! 🙏

How helpful was this conversation?

Reply with a number from **1 (bad)** to **5 (excellent)**.`,
      success: `Thank you for the feedback! Your input helps us improve. 💙`,
      follow_up: `Sorry this wasn't great. If you'd like, briefly tell us what went wrong and a human will review it.`,
    },
    requires_human: false,
    variables: {
      trigger_on: 'conversation_closed',
      feedback_webhook: '{{tenant.feedback_webhook_url}}',
    },
  },

  // 8️⃣ OPT-OUT / UNSUBSCRIBE FLOW
  opt_out: {
    type: 'opt_out',
    channel: 'both',
    trigger_keywords: ['stop', 'unsubscribe', 'opt out', 'remove me', 'no more'],
    messages: {
      initial: `You've been unsubscribed from automated messages. ✅

You can still message us anytime, but we won't send you promotions.

Reply **START** if you ever want to re-enable updates.`,
      success: `You're all set. You won't receive promotional messages anymore.`,
    },
    requires_human: false,
    variables: {
      update_contact_flag: 'allow_marketing = false',
    },
  },
};

/**
 * Get flow template by keywords from user message
 */
export function detectUserFlow(messageText: string): UserFlowType | null {
  const lowerText = messageText.toLowerCase().trim();
  
  // Check each flow's keywords
  for (const [flowType, flow] of Object.entries(USER_FLOWS)) {
    const hasKeyword = flow.trigger_keywords.some((keyword) =>
      lowerText.includes(keyword.toLowerCase())
    );
    
    if (hasKeyword) {
      return flowType as UserFlowType;
    }
  }
  
  return null;
}

/**
 * Replace template variables in message
 */
export function processMessageTemplate(
  template: string,
  variables: Record<string, any>
): string {
  let processed = template;
  
  // Replace {{variable}} with actual values
  const matches = template.match(/\{\{([^}]+)\}\}/g);
  
  if (matches) {
    for (const match of matches) {
      const key = match.slice(2, -2).trim();
      const keys = key.split('.');
      
      let value: any = variables;
      for (const k of keys) {
        value = value?.[k];
      }
      
      if (value !== undefined) {
        processed = processed.replace(match, String(value));
      }
    }
  }
  
  return processed;
}

/**
 * Example workflow JSON for each flow type
 * These can be imported as templates in the visual builder
 */

export const FLOW_WORKFLOW_TEMPLATES = {
  greeting: {
    name: 'Greeting Flow',
    nodes: [
      {
        type: 'trigger',
        config: {
          trigger_type: 'incoming_message',
          channels: ['whatsapp', 'instagram'],
          filters: {
            only_new_conversations: true,
          },
        },
      },
      {
        type: 'send_message',
        config: {
          message_source: 'custom_template',
          custom_message: USER_FLOWS.greeting.messages.initial,
        },
      },
    ],
  },

  faq_pricing: {
    name: 'FAQ - Pricing',
    nodes: [
      {
        type: 'trigger',
        config: {
          trigger_type: 'incoming_message',
          channels: ['whatsapp', 'instagram'],
        },
      },
      {
        type: 'condition',
        config: {
          conditions: [
            {
              field: 'message.text',
              operator: 'contains',
              value: 'price',
            },
          ],
        },
      },
      {
        type: 'ai_reply',
        config: {
          prompt_template: USER_FLOWS.faq.variables?.ai_prompt,
          tone: 'friendly',
          output_variable: 'ai_response',
        },
      },
      {
        type: 'send_message',
        config: {
          message_source: 'ai_output',
          ai_output_variable: '{{ai_response}}',
        },
      },
      {
        type: 'tag_contact',
        config: {
          action: 'add',
          tags: ['FAQ-Pricing'],
        },
      },
    ],
  },

  lead_capture: {
    name: 'Lead Capture Flow',
    nodes: [
      {
        type: 'trigger',
        config: {
          trigger_type: 'incoming_message',
          channels: ['whatsapp', 'instagram'],
        },
      },
      {
        type: 'condition',
        config: {
          conditions: [
            {
              field: 'message.text',
              operator: 'contains',
              value: 'buy',
            },
          ],
        },
      },
      {
        type: 'send_message',
        config: {
          message_source: 'custom_template',
          custom_message: USER_FLOWS.lead_capture.messages.initial,
        },
      },
      {
        type: 'ai_extract',
        config: {
          input_text: '{{message.text}}',
          extract_fields: [
            { name: 'name', type: 'text', description: 'Full name' },
            { name: 'company', type: 'text', description: 'Company name' },
            { name: 'email', type: 'email', description: 'Email address' },
          ],
          output_variable: 'lead_data',
        },
      },
      {
        type: 'http_request',
        config: {
          method: 'POST',
          url: '{{tenant.crm_webhook_url}}',
          body: JSON.stringify({
            name: '{{lead_data.name}}',
            company: '{{lead_data.company}}',
            email: '{{lead_data.email}}',
            channel: '{{channel}}',
            source: 'chat_bot',
          }),
        },
      },
      {
        type: 'send_message',
        config: {
          message_source: 'custom_template',
          custom_message: USER_FLOWS.lead_capture.messages.success,
        },
      },
      {
        type: 'tag_contact',
        config: {
          action: 'add',
          tags: ['Lead', 'Sales-Qualified'],
        },
      },
    ],
  },

  human_handover: {
    name: 'Human Handover',
    nodes: [
      {
        type: 'trigger',
        config: {
          trigger_type: 'incoming_message',
          channels: ['whatsapp', 'instagram'],
        },
      },
      {
        type: 'condition',
        config: {
          conditions: [
            {
              field: 'message.text',
              operator: 'contains',
              value: 'human',
            },
          ],
        },
      },
      {
        type: 'send_message',
        config: {
          message_source: 'custom_template',
          custom_message: USER_FLOWS.human_handover.messages.initial,
        },
      },
      {
        type: 'tag_conversation',
        config: {
          action: 'add',
          tags: ['Human-Required'],
        },
      },
      // This would trigger AI pause in actual implementation
    ],
  },
};

/**
 * Business hours helper functions
 */

export function getBusinessHoursMessage(businessHours: {
  enabled: boolean;
  schedule: Record<string, { enabled: boolean; start: string; end: string }>;
}): string {
  if (!businessHours.enabled) {
    return '24/7';
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const activeDays = days.filter((day) => businessHours.schedule[day]?.enabled);

  if (activeDays.length === 0) return 'Currently closed';

  const firstDay = activeDays[0];
  const hours = businessHours.schedule[firstDay];

  return `${activeDays[0]} - ${activeDays.at(-1)}, ${hours.start} - ${hours.end}`;
}

/**
 * Smart response builder
 * Combines AI with template fallbacks
 */

export async function buildSmartResponse(params: {
  userMessage: string;
  flowType: UserFlowType;
  contactName?: string;
  businessName?: string;
  aiEnabled?: boolean;
}): Promise<string> {
  const flow = USER_FLOWS[params.flowType];

  if (!flow) {
    return "I'm here to help! What can I do for you today?";
  }

  // If AI is enabled for this flow, use AI-generated response
  if (params.aiEnabled && flow.variables?.ai_prompt) {
    processMessageTemplate(flow.variables.ai_prompt, {
      message: { text: params.userMessage },
      tenant: { business_name: params.businessName || 'our company' },
    });

    // Here you would call OpenAI/Claude API
    // For now, return template
    return processMessageTemplate(flow.messages.initial || '', {
      contact: { name: params.contactName || 'there' },
      tenant: { business_name: params.businessName || 'our company' },
    });
  }

  // Otherwise use template
  return processMessageTemplate(flow.messages.initial || '', {
    contact: { name: params.contactName || 'there' },
    tenant: { business_name: params.businessName || 'our company' },
  });
}
