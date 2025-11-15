import { NextRequest, NextResponse } from "next/server";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Instagram Messaging API webhook handler
// Docs: https://developers.facebook.com/docs/messenger-platform/webhooks

/**
 * GET /api/webhooks/instagram - Webhook verification
 * Meta sends a GET request to verify the webhook URL
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // Verify token matches the one you set in Meta App Dashboard
  const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN || "your_verify_token_here";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Instagram webhook verified");
    return new NextResponse(challenge, { status: 200 });
  } else {
    console.error("❌ Instagram webhook verification failed");
    return new NextResponse("Verification failed", { status: 403 });
  }
}

/**
 * POST /api/webhooks/instagram - Receive incoming messages
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Log for debugging
    console.log("📥 Instagram webhook received:", JSON.stringify(body, null, 2));

    // Instagram sends data in this format
    const entry = body.entry?.[0];
    const messaging = entry?.messaging?.[0];
    
    if (!messaging) {
      console.log("⚠️ No messaging data in webhook");
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Extract sender and recipient IDs
    const senderId = messaging.sender?.id;
    const recipientId = messaging.recipient?.id;
    const timestamp = messaging.timestamp;

    if (!senderId) {
      console.log("⚠️ No sender ID in webhook");
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Handle message reads (when user reads your message)
    if (messaging.read) {
      console.log("📖 Message read event:", messaging.read);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Handle message delivery confirmations
    if (messaging.delivery) {
      console.log("📬 Message delivered:", messaging.delivery);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Handle incoming messages
    if (messaging.message) {
      const message = messaging.message;
      const messageId = message.mid;

      // Extract message content based on type
      let messageText = "";
      let messageType = "text";
      let mediaUrl = null;

      if (message.text) {
        messageText = message.text;
      } else if (message.attachments && message.attachments.length > 0) {
        const attachment = message.attachments[0];
        messageType = attachment.type; // image, video, audio, file
        mediaUrl = attachment.payload?.url;
        messageText = `[${attachment.type.toUpperCase()}]`;
      } else if (message.quick_reply) {
        messageText = message.quick_reply.payload || "[Quick Reply]";
        messageType = "quick_reply";
      } else {
        messageText = "[Unknown Message Type]";
      }

      // For now, use default tenant. In production, match by Instagram account ID
      const tenantId = process.env.DEFAULT_TENANT_ID || "default_tenant";

      // 1. Find or create contact by Instagram sender ID
      let contactId: string;
      let contactName = senderId; // Default to sender ID
      
      const contactsRef = collection(db, "contacts");
      const contactQuery = query(
        contactsRef,
        where("instagram_id", "==", senderId),
        where("tenant_id", "==", tenantId)
      );
      const contactSnapshot = await getDocs(contactQuery);

      if (contactSnapshot.empty) {
        // Create new contact
        const newContact = await addDoc(contactsRef, {
          name: senderId, // Instagram doesn't provide name in webhook, fetch separately
          phone: null,
          email: null,
          instagram_id: senderId,
          instagram_username: null, // Fetch via Graph API
          channel: "instagram",
          tags: [],
          conversation_count: 1,
          tenant_id: tenantId,
          custom_fields: {},
          last_contacted: serverTimestamp(),
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        });
        contactId = newContact.id;
        console.log("✅ Created new Instagram contact:", contactId);

        // TODO: Make Graph API call to fetch Instagram username and profile
        // GET /${senderId}?fields=name,username,profile_pic
      } else {
        // Contact exists, update it
        const existingContact = contactSnapshot.docs[0];
        contactId = existingContact.id;
        contactName = existingContact.data().name || senderId;
        
        await updateDoc(doc(db, "contacts", contactId), {
          last_contacted: serverTimestamp(),
          updated_at: serverTimestamp(),
          conversation_count: (existingContact.data().conversation_count || 0) + 1,
        });
      }

      // 2. Find or create conversation
      let conversationId: string;

      const conversationsRef = collection(db, "conversations");
      const convQuery = query(
        conversationsRef,
        where("contact_id", "==", contactId),
        where("status", "in", ["open", "pending"]),
        where("tenant_id", "==", tenantId)
      );
      const convSnapshot = await getDocs(convQuery);

      if (convSnapshot.empty) {
        // Create new conversation
        const newConv = await addDoc(conversationsRef, {
          contact_id: contactId,
          contact_name: contactName,
          contact_phone: null,
          contact_instagram: senderId,
          channel: "instagram",
          status: "open",
          assigned_to: null,
          tags: [],
          last_message_preview: messageText.substring(0, 100),
          last_message_at: serverTimestamp(),
          unread_count: 1,
          ai_enabled: true,
          tenant_id: tenantId,
          metadata: {
            recipient_id: recipientId,
            instagram_id: senderId,
          },
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        });
        conversationId = newConv.id;
        console.log("✅ Created new Instagram conversation:", conversationId);
      } else {
        // Use existing open conversation
        const existingConv = convSnapshot.docs[0];
        conversationId = existingConv.id;

        await updateDoc(doc(db, "conversations", conversationId), {
          last_message_preview: messageText.substring(0, 100),
          unread_count: (existingConv.data().unread_count || 0) + 1,
          status: "open",
          updated_at: serverTimestamp(),
        });
      }

      // 3. Save the message
      const messagesRef = collection(db, "messages");
      await addDoc(messagesRef, {
        conversation_id: conversationId,
        contact_id: contactId,
        tenant_id: tenantId,
        sender_type: "contact",
        content: messageText,
        message_type: messageType,
        media_url: mediaUrl,
        channel: "instagram",
        instagram_message_id: messageId,
        status: "received",
        metadata: {
          sender_id: senderId,
          recipient_id: recipientId,
          timestamp: timestamp,
        },
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      console.log("✅ Instagram message saved for conversation:", conversationId);

      // 4. Trigger workflows and AI auto-reply
      try {
        // Import workflow execution engine
        const { triggerWorkflowsOnMessage } = await import("@/lib/workflows/execution-engine");
        
        // Get conversation history for AI context
        const messagesRef = collection(db, "messages");
        const messagesQuery = query(
          messagesRef,
          where("conversation_id", "==", conversationId)
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        const conversationHistory = messagesSnapshot.docs
          .map((doc) => ({
            sender: doc.data().sender_type === "contact" ? "user" : "assistant",
            content: doc.data().content,
            timestamp: doc.data().created_at,
          }))
          .slice(-10); // Last 10 messages

        // Trigger workflows
        await triggerWorkflowsOnMessage({
          triggerId: "new_message",
          tenantId,
          contactId,
          conversationId,
          messageContent: messageText,
          messageId,
          channel: "instagram",
          contactData: {
            name: contactName,
            instagram_id: senderId,
            tags: [], // Tags will be fetched by workflow engine
          },
          conversationHistory,
        });
        
        console.log("✅ Instagram workflows triggered successfully");
      } catch (workflowError) {
        console.error("❌ Instagram workflow execution error:", workflowError);
        // Don't fail the webhook if workflows fail
      }

      return NextResponse.json(
        { 
          success: true, 
          contactId, 
          conversationId,
          message: "Instagram message processed successfully"
        },
        { status: 200 }
      );
    }

    // Handle story replies
    if (messaging.message?.reply_to?.story) {
      console.log("📖 Story reply received");
      // Handle story reply similar to regular message
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Handle story mentions
    if (messaging.message?.is_echo && messaging.message?.app_id) {
      console.log("📣 Story mention received");
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // If we get here, it's some other webhook event
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("❌ Instagram webhook error:", error);
    
    // Always return 200 to Meta to avoid webhook retries
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 200 }
    );
  }
}
