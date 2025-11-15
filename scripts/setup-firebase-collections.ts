import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

async function setupCollections() {
  const tenantId = "default";

  console.log("🚀 Setting up Firebase collections...\n");

  // 1. Create sample workflows
  console.log("📋 Creating workflows collection...");
  const workflows = [
    {
      id: "flow-1",
      name: "Welcome New Customers",
      tenant_id: tenantId,
      status: "active" as const,
      description: "Automated welcome message for new customers",
      nodes: [
        {
          id: "node_1",
          type: "trigger" as const,
          name: "Incoming Message",
          position: { x: 250, y: 50 },
          data: { trigger_type: "incoming_message", channels: ["whatsapp", "instagram"] },
        },
        {
          id: "node_2",
          type: "condition" as const,
          name: "Check First Time",
          position: { x: 250, y: 180 },
          data: { condition: "is_new_contact", operator: "equals", value: true },
        },
        {
          id: "node_3",
          type: "ai_reply" as const,
          name: "Welcome Message",
          position: { x: 250, y: 310 },
          data: { prompt: "Send a warm welcome message", tone: "friendly" },
        },
      ],
      connections: [
        { id: "edge_1", source: "node_1", target: "node_2" },
        { id: "edge_2", source: "node_2", target: "node_3" },
      ],
      canvas_state: { zoom: 1, pan_x: 0, pan_y: 0 },
      execution_count: 247,
      success_count: 243,
      error_count: 4,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      last_executed_at: serverTimestamp(),
    },
    {
      id: "flow-2",
      name: "Product Inquiry Handler",
      tenant_id: tenantId,
      status: "active" as const,
      description: "AI-powered product inquiry responses",
      nodes: [
        {
          id: "node_1",
          type: "trigger" as const,
          name: "Keyword Trigger",
          position: { x: 250, y: 50 },
          data: { trigger_type: "keyword", keywords: ["price", "product", "buy"] },
        },
        {
          id: "node_2",
          type: "ai_reply" as const,
          name: "AI Product Response",
          position: { x: 250, y: 180 },
          data: { prompt: "Help customer with product inquiry", tone: "professional" },
        },
      ],
      connections: [
        { id: "edge_1", source: "node_1", target: "node_2" },
      ],
      canvas_state: { zoom: 1, pan_x: 0, pan_y: 0 },
      execution_count: 189,
      success_count: 185,
      error_count: 4,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      last_executed_at: serverTimestamp(),
    },
    {
      id: "flow-3",
      name: "Support Ticket Escalation",
      tenant_id: tenantId,
      status: "inactive" as const,
      description: "Escalate complex issues to human agents",
      nodes: [
        {
          id: "node_1",
          type: "trigger" as const,
          name: "Incoming Message",
          position: { x: 250, y: 50 },
          data: { trigger_type: "incoming_message" },
        },
        {
          id: "node_2",
          type: "condition" as const,
          name: "Check Sentiment",
          position: { x: 250, y: 180 },
          data: { condition: "sentiment", operator: "equals", value: "negative" },
        },
        {
          id: "node_3",
          type: "tag" as const,
          name: "Add Urgent Tag",
          position: { x: 250, y: 310 },
          data: { tags: ["urgent", "support"] },
        },
      ],
      connections: [
        { id: "edge_1", source: "node_1", target: "node_2" },
        { id: "edge_2", source: "node_2", target: "node_3" },
      ],
      canvas_state: { zoom: 1, pan_x: 0, pan_y: 0 },
      execution_count: 0,
      success_count: 0,
      error_count: 0,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    },
  ];

  for (const workflow of workflows) {
    await setDoc(doc(db, "workflows", workflow.id), workflow);
    console.log(`  ✅ Created workflow: ${workflow.name}`);
  }

  // 2. Create sample contacts
  console.log("\n👥 Creating contacts collection...");
  const contacts = [
    {
      id: "contact-1",
      tenant_id: tenantId,
      name: "Sarah Johnson",
      phone: "+1-555-0123",
      channel: "whatsapp" as const,
      tags: ["customer", "vip"],
      custom_fields: { order_count: 5, lifetime_value: 1250 },
      last_contacted: serverTimestamp(),
      conversation_count: 8,
      notes: "Preferred customer, responds well to promotional offers",
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    },
    {
      id: "contact-2",
      tenant_id: tenantId,
      name: "Mike Chen",
      instagram_username: "@mikechen",
      channel: "instagram" as const,
      tags: ["lead", "interested"],
      custom_fields: { source: "instagram_ad", interest: "premium_plan" },
      last_contacted: serverTimestamp(),
      conversation_count: 3,
      notes: "Asking about pricing, potential high-value customer",
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    },
    {
      id: "contact-3",
      tenant_id: tenantId,
      name: "Emily Rodriguez",
      phone: "+1-555-0456",
      email: "emily.r@example.com",
      channel: "both" as const,
      tags: ["customer", "support"],
      custom_fields: { subscription: "pro", renewal_date: "2025-12-01" },
      last_contacted: serverTimestamp(),
      conversation_count: 12,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    },
  ];

  for (const contact of contacts) {
    await setDoc(doc(db, "contacts", contact.id), contact);
    console.log(`  ✅ Created contact: ${contact.name}`);
  }

  // 3. Create sample conversations
  console.log("\n💬 Creating conversations collection...");
  const conversations = [
    {
      id: "conv-1",
      tenant_id: tenantId,
      contact_id: "contact-1",
      contact_name: "Sarah Johnson",
      contact_phone: "+1-555-0123",
      channel: "whatsapp" as const,
      status: "active" as const,
      assigned_to: "agent-1",
      last_message: "Thanks! When will it arrive?",
      last_message_time: serverTimestamp(),
      unread_count: 1,
      tags: ["order-inquiry"],
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    },
    {
      id: "conv-2",
      tenant_id: tenantId,
      contact_id: "contact-2",
      contact_name: "Mike Chen",
      channel: "instagram" as const,
      status: "active" as const,
      last_message: "What's the difference between Pro and Enterprise?",
      last_message_time: serverTimestamp(),
      unread_count: 2,
      tags: ["pricing-question"],
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    },
    {
      id: "conv-3",
      tenant_id: tenantId,
      contact_id: "contact-3",
      contact_name: "Emily Rodriguez",
      contact_phone: "+1-555-0456",
      channel: "whatsapp" as const,
      status: "resolved" as const,
      assigned_to: "agent-2",
      last_message: "Perfect, that solved it. Thank you!",
      last_message_time: serverTimestamp(),
      unread_count: 0,
      tags: ["resolved", "technical-support"],
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    },
  ];

  for (const conversation of conversations) {
    await setDoc(doc(db, "conversations", conversation.id), conversation);
    console.log(`  ✅ Created conversation with: ${conversation.contact_name}`);
  }

  // 4. Create sample messages
  console.log("\n📨 Creating messages collection...");
  const messages = [
    {
      id: "msg-1",
      conversation_id: "conv-1",
      sender: "user" as const,
      sender_name: "Sarah Johnson",
      content: "Hi! I just placed an order. Can you confirm?",
      timestamp: serverTimestamp(),
      status: "read" as const,
      metadata: { channel: "whatsapp" as const },
    },
    {
      id: "msg-2",
      conversation_id: "conv-1",
      sender: "ai" as const,
      content: "Hello Sarah! Yes, I can see your order #12345 has been confirmed. It's being processed now.",
      timestamp: serverTimestamp(),
      status: "delivered" as const,
      metadata: { channel: "whatsapp" as const },
    },
    {
      id: "msg-3",
      conversation_id: "conv-1",
      sender: "user" as const,
      sender_name: "Sarah Johnson",
      content: "Thanks! When will it arrive?",
      timestamp: serverTimestamp(),
      status: "sent" as const,
      metadata: { channel: "whatsapp" as const },
    },
  ];

  for (const message of messages) {
    await setDoc(doc(db, "messages", message.id), message);
    console.log(`  ✅ Created message in conversation: ${message.conversation_id}`);
  }

  // 5. Create execution logs
  console.log("\n📊 Creating execution_logs collection...");
  const now = new Date();
  const executionLogs = [
    {
      id: "exec-1",
      tenant_id: tenantId,
      workflow_id: "flow-1",
      workflow_name: "Welcome New Customers",
      status: "success" as const,
      started_at: new Date(now.getTime() - 5000),
      completed_at: now,
      duration_ms: 1247,
      steps_completed: 3,
      total_steps: 3,
      trigger_data: { contact: "Sarah Johnson", channel: "whatsapp" },
      logs: [
        {
          timestamp: new Date(now.getTime() - 4000),
          step_name: "Incoming Message",
          status: "success" as const,
          message: "Message received from Sarah Johnson",
        },
        {
          timestamp: new Date(now.getTime() - 2000),
          step_name: "Check First Time",
          status: "success" as const,
          message: "Contact is new user",
        },
        {
          timestamp: now,
          step_name: "Welcome Message",
          status: "success" as const,
          message: "Welcome message sent successfully",
        },
      ],
    },
    {
      id: "exec-2",
      tenant_id: tenantId,
      workflow_id: "flow-2",
      workflow_name: "Product Inquiry Handler",
      status: "success" as const,
      started_at: new Date(now.getTime() - 3000),
      completed_at: now,
      duration_ms: 892,
      steps_completed: 2,
      total_steps: 2,
      trigger_data: { keyword: "price", contact: "Mike Chen" },
      logs: [
        {
          timestamp: new Date(now.getTime() - 2000),
          step_name: "Keyword Trigger",
          status: "success" as const,
          message: "Keyword 'price' detected",
        },
        {
          timestamp: now,
          step_name: "AI Product Response",
          status: "success" as const,
          message: "AI response generated and sent",
        },
      ],
    },
  ];

  for (const log of executionLogs) {
    await setDoc(doc(db, "execution_logs", log.id), log);
    console.log(`  ✅ Created execution log: ${log.workflow_name}`);
  }

  // 6. Create tenant settings
  console.log("\n⚙️  Creating tenant_settings collection...");
  const tenantSettings = {
    tenant_id: tenantId,
    business: {
      business_name: "BizBoard Demo",
      logo_url: "",
      website: "https://bizboard.example.com",
      industry: "E-commerce",
      country: "United States",
      support_email: "support@bizboard.example.com",
      support_phone: "+1-555-0100",
      address: "123 Business St, San Francisco, CA 94105",
      timezone: "America/Los_Angeles",
      language: "en",
      currency: "USD",
    },
    whatsapp: {
      connected: true,
      phone_number: "+1-555-0100",
      phone_number_id: "123456789",
      waba_id: "987654321",
      access_token: "EAAxxxxx...",
      verify_token: "my_verify_token",
      default_language: "en",
      auto_download_media: true,
      auto_replies_enabled: true,
      workflows_only: false,
      rate_limit: "60",
    },
    instagram: {
      connected: true,
      username: "bizboard_demo",
      ig_business_account_id: "123456789",
      page_id: "987654321",
      access_token: "EAAxxxxx...",
      verify_token: "my_verify_token",
      quick_replies_enabled: true,
      auto_media_handling: true,
      story_replies_enabled: true,
      auto_replies_enabled: true,
      workflows_only: false,
      rate_limit: "40",
    },
    ai: {
      system_prompt: "You are a helpful assistant for BizBoard. Respond politely and concisely.",
      tone: "professional",
      default_language: "en",
      auto_detect_language: true,
      reply_in_user_language: true,
      use_conversation_history: true,
      use_workflow_variables: true,
      allow_long_replies: false,
      max_reply_length: 500,
      enable_human_fallback: true,
      emojis_allowed: true,
      fallback_message: "I'm not fully sure about that. Let me connect you with a human team member who can help.",
      context_retention: "24",
      ai_memory: true,
    },
    business_hours: {
      enabled: true,
      schedule: [
        { day: "Monday", enabled: true, start: "09:00", end: "17:00" },
        { day: "Tuesday", enabled: true, start: "09:00", end: "17:00" },
        { day: "Wednesday", enabled: true, start: "09:00", end: "17:00" },
        { day: "Thursday", enabled: true, start: "09:00", end: "17:00" },
        { day: "Friday", enabled: true, start: "09:00", end: "17:00" },
        { day: "Saturday", enabled: false, start: "09:00", end: "17:00" },
        { day: "Sunday", enabled: false, start: "09:00", end: "17:00" },
      ],
      out_of_hours_message: "Thanks for your message! We're currently offline. Our business hours are Monday-Friday, 9am-5pm.",
      allow_ai_outside_hours: true,
    },
    updated_at: serverTimestamp(),
  };

  await setDoc(doc(db, "tenant_settings", tenantId), tenantSettings);
  console.log("  ✅ Created tenant settings\n");

  console.log("✨ Firebase collections setup complete!\n");
  console.log("📋 Created collections:");
  console.log("   - workflows (3 documents)");
  console.log("   - contacts (3 documents)");
  console.log("   - conversations (3 documents)");
  console.log("   - messages (3 documents)");
  console.log("   - execution_logs (2 documents)");
  console.log("   - tenant_settings (1 document)\n");
  console.log("🔥 Your Firebase is now ready for real-time sync!\n");
}

setupCollections()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error setting up collections:", error);
    process.exit(1);
  });
