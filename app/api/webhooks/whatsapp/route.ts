import { NextRequest, NextResponse } from "next/server";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

// WhatsApp Cloud API webhook handler
// Docs: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks

/**
 * GET /api/webhooks/whatsapp - Webhook verification
 * Meta sends a GET request to verify the webhook URL
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // Verify token matches the one you set in Meta App Dashboard
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "your_verify_token_here";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ WhatsApp webhook verified");
    return new NextResponse(challenge, { status: 200 });
  } else {
    console.error("❌ WhatsApp webhook verification failed");
    return new NextResponse("Verification failed", { status: 403 });
  }
}

/**
 * POST /api/webhooks/whatsapp - Receive incoming messages
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Log for debugging
    console.log("📥 WhatsApp webhook received:", JSON.stringify(body, null, 2));

    // WhatsApp sends data in this format
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    
    if (!value) {
      console.log("⚠️ No value in webhook");
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Handle status updates (message delivered, read, etc.)
    if (value.statuses) {
      console.log("📊 Status update received:", value.statuses);
      // You can update message status in your database here
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Handle incoming messages
    if (value.messages && value.messages.length > 0) {
      const message = value.messages[0];
      const from = message.from; // Sender's phone number
      const messageId = message.id;
      const timestamp = message.timestamp;

      // Get contact info from webhook metadata
      const contactName = value.contacts?.[0]?.profile?.name || from;

      // Extract message content based on type
      let messageText = "";
      let messageType = "text";
      let mediaUrl = null;

      switch (message.type) {
        case "text":
          messageText = message.text?.body || "";
          break;
        case "image":
          messageType = "image";
          mediaUrl = message.image?.id || message.image?.link;
          messageText = message.image?.caption || "[Image]";
          break;
        case "video":
          messageType = "video";
          mediaUrl = message.video?.id || message.video?.link;
          messageText = message.video?.caption || "[Video]";
          break;
        case "audio":
          messageType = "audio";
          mediaUrl = message.audio?.id || message.audio?.link;
          messageText = "[Audio]";
          break;
        case "document":
          messageType = "document";
          mediaUrl = message.document?.id || message.document?.link;
          messageText = message.document?.filename || "[Document]";
          break;
        case "location":
          messageType = "location";
          messageText = `[Location: ${message.location?.latitude}, ${message.location?.longitude}]`;
          break;
        case "button":
          messageText = message.button?.text || "[Button Response]";
          break;
        case "interactive":
          messageType = "interactive";
          messageText = message.interactive?.button_reply?.title ||
                       message.interactive?.list_reply?.title ||
                       "[Interactive Response]";
          break;
        default:
          messageText = `[${message.type}]`;
      }

      // Find tenant that owns this WhatsApp number
      const businessPhone = value.metadata?.phone_number_id || value.metadata?.display_phone_number;
      
      // For now, use default tenant. In production, match by phone number
      // TODO: Query workspaces to find which tenant owns this WhatsApp number
      const tenantId = process.env.DEFAULT_TENANT_ID || "default_tenant";

      // 1. Find or create contact
      let contactId: string;
      
      const contactsRef = collection(db, "contacts");
      const contactQuery = query(
        contactsRef,
        where("phone", "==", from),
        where("tenant_id", "==", tenantId)
      );
      const contactSnapshot = await getDocs(contactQuery);

      if (contactSnapshot.empty) {
        // Create new contact
        const newContact = await addDoc(contactsRef, {
          name: contactName,
          phone: from,
          email: null,
          instagram_username: null,
          channel: "whatsapp",
          tags: [],
          conversation_count: 1,
          tenant_id: tenantId,
          custom_fields: {},
          last_contacted: serverTimestamp(),
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        });
        contactId = newContact.id;
        console.log("✅ Created new contact:", contactId);
      } else {
        // Contact exists, update it
        const existingContact = contactSnapshot.docs[0];
        contactId = existingContact.id;
        
        await updateDoc(doc(db, "contacts", contactId), {
          name: contactName, // Update name if changed
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
          contact_phone: from,
          channel: "whatsapp",
          status: "open",
          assigned_to: null,
          tags: [],
          last_message_preview: messageText.substring(0, 100),
          last_message_at: serverTimestamp(),
          unread_count: 1,
          ai_enabled: true,
          tenant_id: tenantId,
          metadata: {
            business_phone: businessPhone,
          },
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        });
        conversationId = newConv.id;
        console.log("✅ Created new conversation:", conversationId);
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
        channel: "whatsapp",
        whatsapp_message_id: messageId,
        status: "received",
        metadata: {
          from: from,
          timestamp: timestamp,
          webhook_id: body.entry?.[0]?.id,
        },
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      console.log("✅ Message saved for conversation:", conversationId);

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
          channel: "whatsapp",
          contactData: {
            name: contactName,
            phone: from,
            tags: [], // TODO: Fetch from contact document
          },
          conversationHistory,
        });
        
        console.log("✅ Workflows triggered successfully");
      } catch (workflowError) {
        console.error("❌ Workflow execution error:", workflowError);
        // Don't fail the webhook if workflows fail
      }

      return NextResponse.json(
        { 
          success: true, 
          contactId, 
          conversationId,
          message: "Message processed successfully"
        },
        { status: 200 }
      );
    }

    // If we get here, it's some other webhook event
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("❌ WhatsApp webhook error:", error);
    
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
