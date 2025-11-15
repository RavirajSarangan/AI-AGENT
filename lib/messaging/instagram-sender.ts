/**
 * Instagram Messaging API sender
 * Docs: https://developers.facebook.com/docs/messenger-platform/instagram/features/send-message
 */

const INSTAGRAM_API_URL = "https://graph.facebook.com/v21.0";
const PAGE_ID = process.env.INSTAGRAM_PAGE_ID;
const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

interface SendTextMessageParams {
  recipientId: string; // Instagram-scoped user ID (IGSID)
  message: string;
}

interface SendMediaMessageParams {
  recipientId: string;
  mediaType: "image" | "video" | "audio" | "file";
  mediaUrl: string;
}

interface SendQuickReplyParams {
  recipientId: string;
  message: string;
  quickReplies: Array<{
    content_type: "text";
    title: string;
    payload: string;
  }>;
}

interface SendGenericTemplateParams {
  recipientId: string;
  elements: Array<{
    title: string;
    subtitle?: string;
    image_url?: string;
    buttons?: Array<{
      type: "web_url" | "postback";
      title: string;
      url?: string;
      payload?: string;
    }>;
  }>;
}

/**
 * Send a text message via Instagram
 */
export async function sendInstagramTextMessage({
  recipientId,
  message,
}: SendTextMessageParams) {
  if (!PAGE_ID || !ACCESS_TOKEN) {
    throw new Error("Instagram credentials not configured");
  }

  try {
    const response = await fetch(
      `${INSTAGRAM_API_URL}/${PAGE_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: {
            id: recipientId,
          },
          message: {
            text: message,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Instagram API error:", errorData);
      throw new Error(`Instagram API error: ${errorData.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    console.log("✅ Instagram message sent:", data);
    
    return {
      success: true,
      messageId: data.message_id,
      recipientId: data.recipient_id,
      data,
    };
  } catch (error) {
    console.error("❌ Failed to send Instagram message:", error);
    throw error;
  }
}

/**
 * Send media via Instagram (image, video, audio, file)
 */
export async function sendInstagramMediaMessage({
  recipientId,
  mediaType,
  mediaUrl,
}: SendMediaMessageParams) {
  if (!PAGE_ID || !ACCESS_TOKEN) {
    throw new Error("Instagram credentials not configured");
  }

  try {
    // Map our mediaType to Instagram's attachment type
    const attachmentType = mediaType === "file" ? "file" : mediaType;

    const response = await fetch(
      `${INSTAGRAM_API_URL}/${PAGE_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: {
            id: recipientId,
          },
          message: {
            attachment: {
              type: attachmentType,
              payload: {
                url: mediaUrl,
                is_reusable: false,
              },
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Instagram media error:", errorData);
      throw new Error(`Instagram media error: ${errorData.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    console.log(`✅ Instagram ${mediaType} sent:`, data);
    
    return {
      success: true,
      messageId: data.message_id,
      recipientId: data.recipient_id,
      data,
    };
  } catch (error) {
    console.error(`❌ Failed to send Instagram ${mediaType}:`, error);
    throw error;
  }
}

/**
 * Send message with quick reply buttons
 */
export async function sendInstagramQuickReply({
  recipientId,
  message,
  quickReplies,
}: SendQuickReplyParams) {
  if (!PAGE_ID || !ACCESS_TOKEN) {
    throw new Error("Instagram credentials not configured");
  }

  try {
    const response = await fetch(
      `${INSTAGRAM_API_URL}/${PAGE_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: {
            id: recipientId,
          },
          message: {
            text: message,
            quick_replies: quickReplies,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Instagram quick reply error:", errorData);
      throw new Error(`Instagram quick reply error: ${errorData.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    console.log("✅ Instagram quick reply sent:", data);
    
    return {
      success: true,
      messageId: data.message_id,
      recipientId: data.recipient_id,
      data,
    };
  } catch (error) {
    console.error("❌ Failed to send Instagram quick reply:", error);
    throw error;
  }
}

/**
 * Send a generic template (card carousel)
 */
export async function sendInstagramGenericTemplate({
  recipientId,
  elements,
}: SendGenericTemplateParams) {
  if (!PAGE_ID || !ACCESS_TOKEN) {
    throw new Error("Instagram credentials not configured");
  }

  try {
    const response = await fetch(
      `${INSTAGRAM_API_URL}/${PAGE_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: {
            id: recipientId,
          },
          message: {
            attachment: {
              type: "template",
              payload: {
                template_type: "generic",
                elements: elements,
              },
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Instagram template error:", errorData);
      throw new Error(`Instagram template error: ${errorData.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    console.log("✅ Instagram template sent:", data);
    
    return {
      success: true,
      messageId: data.message_id,
      recipientId: data.recipient_id,
      data,
    };
  } catch (error) {
    console.error("❌ Failed to send Instagram template:", error);
    throw error;
  }
}

/**
 * Send typing indicator (typing_on or typing_off)
 */
export async function sendInstagramTypingIndicator(
  recipientId: string,
  action: "typing_on" | "typing_off" = "typing_on"
) {
  if (!PAGE_ID || !ACCESS_TOKEN) {
    throw new Error("Instagram credentials not configured");
  }

  try {
    const response = await fetch(
      `${INSTAGRAM_API_URL}/${PAGE_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: {
            id: recipientId,
          },
          sender_action: action,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Instagram typing indicator error:", errorData);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Failed to send Instagram typing indicator:", error);
    return { success: false };
  }
}

/**
 * Mark message as seen
 */
export async function markInstagramMessageAsSeen(recipientId: string) {
  if (!PAGE_ID || !ACCESS_TOKEN) {
    throw new Error("Instagram credentials not configured");
  }

  try {
    const response = await fetch(
      `${INSTAGRAM_API_URL}/${PAGE_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: {
            id: recipientId,
          },
          sender_action: "mark_seen",
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Instagram mark seen error:", errorData);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Failed to mark Instagram message as seen:", error);
    return { success: false };
  }
}

/**
 * Get user profile information
 */
export async function getInstagramUserProfile(userId: string) {
  if (!ACCESS_TOKEN) {
    throw new Error("Instagram access token not configured");
  }

  try {
    const response = await fetch(
      `${INSTAGRAM_API_URL}/${userId}?fields=name,username,profile_pic&access_token=${ACCESS_TOKEN}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Instagram profile fetch error:", errorData);
      throw new Error(`Instagram profile error: ${errorData.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    console.log("✅ Instagram profile fetched:", data);
    
    return {
      success: true,
      name: data.name,
      username: data.username,
      profilePic: data.profile_pic,
    };
  } catch (error) {
    console.error("❌ Failed to fetch Instagram profile:", error);
    throw error;
  }
}
