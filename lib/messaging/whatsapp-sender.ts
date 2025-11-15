/**
 * WhatsApp Cloud API message sender
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages
 */

const WHATSAPP_API_URL = "https://graph.facebook.com/v21.0";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

interface SendTextMessageParams {
  to: string; // Recipient phone number (with country code, no +)
  message: string;
  previewUrl?: boolean; // Enable link preview
}

interface SendTemplateMessageParams {
  to: string;
  templateName: string;
  languageCode?: string; // e.g., "en_US", "pt_BR"
  components?: Array<{
    type: string;
    parameters: Array<{
      type: string;
      text?: string;
      image?: { link: string };
      video?: { link: string };
      document?: { link: string };
    }>;
  }>;
}

interface SendMediaMessageParams {
  to: string;
  mediaType: "image" | "video" | "audio" | "document";
  mediaUrl: string;
  caption?: string;
  filename?: string; // For documents
}

interface SendInteractiveMessageParams {
  to: string;
  type: "button" | "list";
  header?: {
    type: "text" | "image" | "video" | "document";
    text?: string;
    link?: string;
  };
  body: string;
  footer?: string;
  buttons?: Array<{
    id: string;
    title: string;
  }>;
  listSections?: Array<{
    title: string;
    rows: Array<{
      id: string;
      title: string;
      description?: string;
    }>;
  }>;
  buttonText?: string; // For list messages
}

/**
 * Send a text message via WhatsApp
 */
export async function sendWhatsAppTextMessage({
  to,
  message,
  previewUrl = false,
}: SendTextMessageParams) {
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    throw new Error("WhatsApp credentials not configured");
  }

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: to,
          type: "text",
          text: {
            preview_url: previewUrl,
            body: message,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("WhatsApp API error:", errorData);
      throw new Error(`WhatsApp API error: ${errorData.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    console.log("✅ WhatsApp message sent:", data);
    
    return {
      success: true,
      messageId: data.messages?.[0]?.id,
      data,
    };
  } catch (error) {
    console.error("❌ Failed to send WhatsApp message:", error);
    throw error;
  }
}

/**
 * Send a template message via WhatsApp
 * Templates must be pre-approved in Meta Business Manager
 */
export async function sendWhatsAppTemplateMessage({
  to,
  templateName,
  languageCode = "en_US",
  components = [],
}: SendTemplateMessageParams) {
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    throw new Error("WhatsApp credentials not configured");
  }

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: to,
          type: "template",
          template: {
            name: templateName,
            language: {
              code: languageCode,
            },
            components: components,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("WhatsApp template error:", errorData);
      throw new Error(`WhatsApp template error: ${errorData.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    console.log("✅ WhatsApp template sent:", data);
    
    return {
      success: true,
      messageId: data.messages?.[0]?.id,
      data,
    };
  } catch (error) {
    console.error("❌ Failed to send WhatsApp template:", error);
    throw error;
  }
}

/**
 * Send media (image, video, audio, document) via WhatsApp
 */
export async function sendWhatsAppMediaMessage({
  to,
  mediaType,
  mediaUrl,
  caption,
  filename,
}: SendMediaMessageParams) {
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    throw new Error("WhatsApp credentials not configured");
  }

  try {
    const mediaPayload: Record<string, unknown> = {
      link: mediaUrl,
    };

    if (caption && (mediaType === "image" || mediaType === "video")) {
      mediaPayload.caption = caption;
    }

    if (filename && mediaType === "document") {
      mediaPayload.filename = filename;
    }

    const response = await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: to,
          type: mediaType,
          [mediaType]: mediaPayload,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("WhatsApp media error:", errorData);
      throw new Error(`WhatsApp media error: ${errorData.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    console.log(`✅ WhatsApp ${mediaType} sent:`, data);
    
    return {
      success: true,
      messageId: data.messages?.[0]?.id,
      data,
    };
  } catch (error) {
    console.error(`❌ Failed to send WhatsApp ${mediaType}:`, error);
    throw error;
  }
}

/**
 * Send interactive message (buttons or list) via WhatsApp
 */
export async function sendWhatsAppInteractiveMessage({
  to,
  type,
  header,
  body,
  footer,
  buttons,
  listSections,
  buttonText = "Choose an option",
}: SendInteractiveMessageParams) {
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    throw new Error("WhatsApp credentials not configured");
  }

  try {
    const interactivePayload: Record<string, unknown> = {
      type: type,
      body: {
        text: body,
      },
    };

    if (header) {
      interactivePayload.header = header;
    }

    if (footer) {
      interactivePayload.footer = {
        text: footer,
      };
    }

    if (type === "button" && buttons) {
      interactivePayload.action = {
        buttons: buttons.map((btn) => ({
          type: "reply",
          reply: {
            id: btn.id,
            title: btn.title,
          },
        })),
      };
    }

    if (type === "list" && listSections) {
      interactivePayload.action = {
        button: buttonText,
        sections: listSections,
      };
    }

    const response = await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: to,
          type: "interactive",
          interactive: interactivePayload,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("WhatsApp interactive error:", errorData);
      throw new Error(`WhatsApp interactive error: ${errorData.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    console.log("✅ WhatsApp interactive message sent:", data);
    
    return {
      success: true,
      messageId: data.messages?.[0]?.id,
      data,
    };
  } catch (error) {
    console.error("❌ Failed to send WhatsApp interactive message:", error);
    throw error;
  }
}

/**
 * Mark a message as read
 */
export async function markWhatsAppMessageAsRead(messageId: string) {
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    throw new Error("WhatsApp credentials not configured");
  }

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          status: "read",
          message_id: messageId,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("WhatsApp mark read error:", errorData);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Failed to mark WhatsApp message as read:", error);
    return { success: false };
  }
}
