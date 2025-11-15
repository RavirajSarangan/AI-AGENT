/**
 * OpenAI Integration Service
 * Handles AI-powered response generation for conversations
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4-turbo";

interface GenerateReplyParams {
  conversationHistory: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  contactName: string;
  contactTags?: string[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

interface AIReplyResult {
  success: boolean;
  reply?: string;
  error?: string;
  tokensUsed?: number;
}

/**
 * Generate an AI reply based on conversation context
 */
export async function generateAIReply({
  conversationHistory,
  contactName,
  contactTags = [],
  systemPrompt,
  temperature = 0.7,
  maxTokens = 500,
}: GenerateReplyParams): Promise<AIReplyResult> {
  if (!OPENAI_API_KEY) {
    return {
      success: false,
      error: "OpenAI API key not configured",
    };
  }

  try {
    // Build the default system prompt if not provided
    const defaultSystemPrompt = `You are a helpful AI assistant for a business. You are chatting with ${contactName}.

Your role:
- Provide friendly, professional customer support
- Answer questions about products and services
- Help with order inquiries and issues
- Be concise but thorough
- Use a warm, conversational tone
- If you don't know something, admit it and offer to connect them with a human agent

${contactTags.length > 0 ? `Customer tags: ${contactTags.join(", ")}` : ""}

Guidelines:
- Keep responses under 3 sentences when possible
- Use simple, clear language
- Avoid jargon unless the customer uses it first
- Never make promises you can't keep
- Always prioritize customer satisfaction`;

    const messages = [
      {
        role: "system" as const,
        content: systemPrompt || defaultSystemPrompt,
      },
      ...conversationHistory,
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: messages,
        temperature: temperature,
        max_tokens: maxTokens,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      return {
        success: false,
        error: `OpenAI API error: ${errorData.error?.message || "Unknown error"}`,
      };
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return {
        success: false,
        error: "No response generated from OpenAI",
      };
    }

    return {
      success: true,
      reply: reply.trim(),
      tokensUsed: data.usage?.total_tokens || 0,
    };
  } catch (error) {
    console.error("Failed to generate AI reply:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Build conversation history from message array
 */
export function buildConversationHistory(
  messages: Array<{
    sender: string;
    content: string;
    timestamp?: Date | any;
  }>,
  maxMessages: number = 10
): Array<{ role: "user" | "assistant"; content: string }> {
  // Take only the most recent messages
  const recentMessages = messages.slice(-maxMessages);

  return recentMessages.map((msg) => ({
    role: msg.sender === "user" || msg.sender === "contact" ? "user" : "assistant",
    content: msg.content,
  }));
}

/**
 * Check if AI should reply to this message
 */
export function shouldAIReply(
  message: string,
  conversationMetadata?: {
    aiEnabled?: boolean;
    aiPaused?: boolean;
    assignedTo?: string | null;
  }
): boolean {
  // Don't reply if AI is disabled or paused
  if (conversationMetadata?.aiEnabled === false || conversationMetadata?.aiPaused === true) {
    return false;
  }

  // Don't reply if conversation is assigned to a human agent
  if (conversationMetadata?.assignedTo) {
    return false;
  }

  // Don't reply to very short messages (likely just greetings)
  if (message.trim().length < 3) {
    return false;
  }

  // Add more sophisticated logic here:
  // - Check for urgency keywords
  // - Check for opt-out phrases
  // - Check business hours
  // - etc.

  return true;
}

/**
 * Analyze message sentiment (basic implementation)
 */
export function analyzeMessageSentiment(message: string): "positive" | "neutral" | "negative" {
  const lowerMessage = message.toLowerCase();

  // Positive keywords
  const positiveKeywords = ["thank", "thanks", "great", "awesome", "perfect", "love", "excellent"];
  const positiveCount = positiveKeywords.filter((kw) => lowerMessage.includes(kw)).length;

  // Negative keywords
  const negativeKeywords = ["problem", "issue", "complaint", "bad", "terrible", "hate", "angry", "upset"];
  const negativeCount = negativeKeywords.filter((kw) => lowerMessage.includes(kw)).length;

  if (negativeCount > positiveCount) return "negative";
  if (positiveCount > negativeCount) return "positive";
  return "neutral";
}

/**
 * Extract intent from message (basic implementation)
 */
export function extractMessageIntent(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("price") || lowerMessage.includes("cost") || lowerMessage.includes("how much")) {
    return "pricing_inquiry";
  }

  if (lowerMessage.includes("order") && (lowerMessage.includes("status") || lowerMessage.includes("track"))) {
    return "order_status";
  }

  if (lowerMessage.includes("return") || lowerMessage.includes("refund")) {
    return "return_request";
  }

  if (lowerMessage.includes("help") || lowerMessage.includes("support")) {
    return "support_request";
  }

  if (lowerMessage.includes("buy") || lowerMessage.includes("purchase") || lowerMessage.includes("order")) {
    return "purchase_intent";
  }

  return "general_inquiry";
}

/**
 * Generate a quick reply suggestion based on message
 */
export function generateQuickReplySuggestions(message: string): string[] {
  const intent = extractMessageIntent(message);
  const sentiment = analyzeMessageSentiment(message);

  const suggestions: { [key: string]: string[] } = {
    pricing_inquiry: [
      "Let me check our current pricing for you",
      "I'll send you our price list right away",
      "What specific product are you interested in?",
    ],
    order_status: [
      "I'll look up your order status immediately",
      "Can you provide your order number?",
      "Let me track that for you",
    ],
    return_request: [
      "I understand you'd like to return something. Let me help",
      "Our return policy allows returns within 30 days",
      "I'll process your return request right away",
    ],
    support_request: [
      "I'm here to help! What seems to be the issue?",
      "Let me assist you with that",
      "Tell me more about the problem you're experiencing",
    ],
    purchase_intent: [
      "Great! I'd be happy to help you make a purchase",
      "Let me show you our available options",
      "What are you looking for specifically?",
    ],
    general_inquiry: [
      "How can I help you today?",
      "I'd be happy to answer your questions",
      "Tell me more about what you need",
    ],
  };

  // Add sentiment-based suggestions
  if (sentiment === "negative") {
    return [
      "I sincerely apologize for the inconvenience",
      "Let me escalate this to my supervisor right away",
      "I understand your frustration. Let me help fix this",
    ];
  }

  return suggestions[intent] || suggestions.general_inquiry;
}

/**
 * Format AI reply with personalization
 */
export function formatAIReply(reply: string, contactName: string): string {
  // Add contact name if not already present
  if (!reply.toLowerCase().includes(contactName.toLowerCase().split(" ")[0])) {
    return reply;
  }

  return reply;
}

/**
 * Calculate confidence score for AI reply (0-1)
 */
export function calculateReplyConfidence(
  messageContent: string,
  conversationLength: number,
  contactTags: string[]
): number {
  let confidence = 0.5; // Base confidence

  // Increase confidence with more conversation context
  if (conversationLength > 5) confidence += 0.2;
  else if (conversationLength > 2) confidence += 0.1;

  // Increase confidence if customer has helpful tags
  if (contactTags.includes("vip") || contactTags.includes("regular")) {
    confidence += 0.1;
  }

  // Decrease confidence for complex/sensitive topics
  const complexKeywords = ["legal", "lawsuit", "lawyer", "emergency", "urgent"];
  if (complexKeywords.some((kw) => messageContent.toLowerCase().includes(kw))) {
    confidence -= 0.3;
  }

  // Ensure confidence is between 0 and 1
  return Math.max(0, Math.min(1, confidence));
}

/**
 * Main function to handle AI auto-reply logic
 */
export async function handleAIAutoReply(params: {
  messageContent: string;
  conversationHistory: Array<{ sender: string; content: string; timestamp?: any }>;
  contactName: string;
  contactTags?: string[];
  conversationMetadata?: {
    aiEnabled?: boolean;
    aiPaused?: boolean;
    assignedTo?: string | null;
  };
  systemPrompt?: string;
}): Promise<AIReplyResult & { shouldReply: boolean; confidence: number }> {
  const {
    messageContent,
    conversationHistory,
    contactName,
    contactTags = [],
    conversationMetadata,
    systemPrompt,
  } = params;

  // Check if AI should reply
  const shouldReply = shouldAIReply(messageContent, conversationMetadata);

  if (!shouldReply) {
    return {
      success: false,
      shouldReply: false,
      confidence: 0,
      error: "AI reply not appropriate for this message",
    };
  }

  // Calculate confidence
  const confidence = calculateReplyConfidence(
    messageContent,
    conversationHistory.length,
    contactTags
  );

  // Generate AI reply
  const formattedHistory = buildConversationHistory(conversationHistory);
  const result = await generateAIReply({
    conversationHistory: formattedHistory,
    contactName,
    contactTags,
    systemPrompt,
  });

  return {
    ...result,
    shouldReply,
    confidence,
  };
}
