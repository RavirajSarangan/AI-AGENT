# WhatsApp & Instagram Webhook Integration Guide

## Overview

This guide explains how to set up WhatsApp Cloud API and Instagram Messaging API webhooks to enable real-time message processing in your AI Agent application.

## Architecture

```
Meta Platform (WhatsApp/Instagram)
    ↓ Incoming Message
Your Application Webhooks
    ↓ Process & Store
Firebase Firestore
    ↓ Trigger Workflows
AI Response / Automation
    ↓ Send Reply
Meta Platform API
    ↓ Delivered
Customer Device
```

## Prerequisites

1. **Meta Business Account** - https://business.facebook.com
2. **WhatsApp Business App** or **Instagram Business Account**
3. **Meta Developer Account** - https://developers.facebook.com
4. **Domain with HTTPS** (for production) or **ngrok** (for development)
5. **Firebase Project** - already configured in your app

## Part 1: WhatsApp Cloud API Setup

### Step 1: Create Meta App

1. Go to https://developers.facebook.com/apps
2. Click "Create App"
3. Select "Business" as app type
4. Enter app name and contact email
5. Click "Create App"

### Step 2: Add WhatsApp Product

1. In your app dashboard, click "Add Product"
2. Find "WhatsApp" and click "Set Up"
3. Select your Business Account (or create one)
4. Click "Continue"

### Step 3: Get Test Phone Number

Meta provides a test phone number to get started:

1. In WhatsApp > API Setup, you'll see a test phone number
2. Add your personal phone number as a recipient
3. Send a test message to verify it works
4. **Note**: Test numbers can only send to 5 pre-registered numbers

### Step 4: Get Credentials

In WhatsApp > API Setup, copy these values to your `.env.local`:

```env
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_ACCESS_TOKEN=your_temporary_access_token
WHATSAPP_VERIFY_TOKEN=your_custom_verify_token  # You create this
```

**Important**: The temporary access token expires in 24 hours. For production, create a System User Token (see below).

### Step 5: Configure Webhook (Local Development)

Since Meta webhooks require HTTPS, use ngrok for local development:

1. Install ngrok: https://ngrok.com/download
2. Start your Next.js app: `npm run dev`
3. In a new terminal, start ngrok:
   ```bash
   ngrok http 3000
   ```
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

Now configure the webhook in Meta:

1. Go to WhatsApp > Configuration
2. Click "Edit" next to Webhook
3. Enter:
   - **Callback URL**: `https://abc123.ngrok.io/api/webhooks/whatsapp`
   - **Verify Token**: Same value as `WHATSAPP_VERIFY_TOKEN` in your `.env.local`
4. Click "Verify and Save"
5. Subscribe to these webhook fields:
   - ✅ `messages`
   - ✅ `message_status` (optional, for delivery confirmations)

### Step 6: Test WhatsApp Integration

1. Send a WhatsApp message to your test number
2. Check your terminal logs - you should see:
   ```
   📥 WhatsApp webhook received: {...}
   ✅ Created new contact: abc123
   ✅ Created new conversation: def456
   ✅ Message saved for conversation: def456
   ```
3. Check Firebase Firestore - you should see new documents in:
   - `contacts` collection
   - `conversations` collection
   - `messages` collection

### Step 7: Production Setup (Add Your Own Phone Number)

For production, you need to:

1. **Add a Phone Number**:
   - Go to WhatsApp > API Setup
   - Click "Add Phone Number"
   - Follow verification process (requires business verification)
   - Costs: ~$30-50 setup + usage fees

2. **Create System User Token**:
   - Go to Meta Business Suite > Settings > Business Settings
   - Click "System Users" under Users
   - Click "Add" to create a system user
   - Assign the user to your WhatsApp app
   - Generate a token with `whatsapp_business_messaging` permission
   - **This token never expires** (recommended for production)

3. **Update Environment Variables**:
   ```env
   WHATSAPP_PHONE_NUMBER_ID=your_real_phone_number_id
   WHATSAPP_ACCESS_TOKEN=your_system_user_token
   ```

4. **Update Webhook URL**:
   - Deploy your app to production (Vercel, AWS, etc.)
   - Update webhook URL to: `https://yourdomain.com/api/webhooks/whatsapp`

---

## Part 2: Instagram Messaging API Setup

### Step 1: Connect Instagram Account

1. Go to https://business.facebook.com
2. Click "Settings" > "Accounts" > "Instagram Accounts"
3. Click "Add" and connect your Instagram Business Account
4. **Important**: Must be a Business or Creator account (not Personal)

### Step 2: Create Meta App (or use existing)

If you already created an app for WhatsApp, you can reuse it. Otherwise:

1. Go to https://developers.facebook.com/apps
2. Create a new Business app
3. Add "Messenger" product (yes, Messenger - Instagram uses the same API)

### Step 3: Connect Instagram to App

1. In your Meta App, go to Messenger > Settings
2. Click "Add or Remove Pages"
3. Select your Instagram Business Account
4. Grant required permissions:
   - `pages_messaging`
   - `instagram_basic`
   - `instagram_manage_messages`

### Step 4: Get Credentials

1. Go to Messenger > Settings > Access Tokens
2. Select your Instagram page
3. Click "Generate Token"
4. Copy the Page ID and Access Token to `.env.local`:

```env
INSTAGRAM_PAGE_ID=your_instagram_page_id
INSTAGRAM_ACCESS_TOKEN=your_page_access_token
INSTAGRAM_VERIFY_TOKEN=your_custom_verify_token  # You create this
```

### Step 5: Configure Webhook

Using ngrok (same as WhatsApp):

1. Ensure ngrok is running: `ngrok http 3000`
2. Go to Messenger > Settings > Webhooks
3. Click "Add Callback URL"
4. Enter:
   - **Callback URL**: `https://abc123.ngrok.io/api/webhooks/instagram`
   - **Verify Token**: Same value as `INSTAGRAM_VERIFY_TOKEN`
5. Click "Verify and Save"
6. Subscribe to these events:
   - ✅ `messages`
   - ✅ `messaging_postbacks`
   - ✅ `message_reads` (optional)
   - ✅ `messaging_handovers` (optional, for human takeover)

### Step 6: Test Instagram Integration

1. Send a DM to your Instagram Business Account
2. Check terminal logs for webhook confirmation
3. Verify data appears in Firebase Firestore

### Step 7: Production Setup

1. **Deploy to Production**:
   - Deploy your app to a hosting service with HTTPS
   - Update webhook URL: `https://yourdomain.com/api/webhooks/instagram`

2. **Request Advanced Access** (for production scale):
   - Go to App Dashboard > App Review > Permissions and Features
   - Request `pages_messaging` and `instagram_manage_messages`
   - Meta will review your app (usually 3-5 days)
   - You may need to submit a demo video showing how your app works

---

## Part 3: Sending Messages

### WhatsApp Outbound Messages

Use the functions in `lib/messaging/whatsapp-sender.ts`:

```typescript
import { sendWhatsAppTextMessage } from "@/lib/messaging/whatsapp-sender";

// Send a text message
await sendWhatsAppTextMessage({
  to: "1234567890", // Phone number without +
  message: "Hello from AI Agent!",
  previewUrl: true, // Enable link previews
});

// Send a template message (must be pre-approved)
await sendWhatsAppTemplateMessage({
  to: "1234567890",
  templateName: "order_confirmation",
  languageCode: "en_US",
  components: [
    {
      type: "body",
      parameters: [
        { type: "text", text: "John Doe" },
        { type: "text", text: "ORD-12345" },
      ],
    },
  ],
});

// Send an image
await sendWhatsAppMediaMessage({
  to: "1234567890",
  mediaType: "image",
  mediaUrl: "https://example.com/image.jpg",
  caption: "Check out this image!",
});
```

### Instagram Outbound Messages

Use the functions in `lib/messaging/instagram-sender.ts`:

```typescript
import { sendInstagramTextMessage } from "@/lib/messaging/instagram-sender";

// Send a text message
await sendInstagramTextMessage({
  recipientId: "instagram_user_id", // IGSID from webhook
  message: "Hello from AI Agent!",
});

// Send quick reply buttons
await sendInstagramQuickReply({
  recipientId: "instagram_user_id",
  message: "Choose an option:",
  quickReplies: [
    { content_type: "text", title: "Yes", payload: "yes" },
    { content_type: "text", title: "No", payload: "no" },
  ],
});

// Send typing indicator
await sendInstagramTypingIndicator("instagram_user_id", "typing_on");
```

---

## Part 4: Message Limits & Rate Limits

### WhatsApp Limits

- **Quality Rating**: Meta assigns a quality rating based on user blocks/reports
- **Messaging Limits**: Start at 1,000 conversations/day, can increase to 100,000+
- **Template Messages**: Can send to anyone, but must be pre-approved
- **Session Messages**: Can send freely for 24h after user messages you
- **Rate Limits**: 
  - 80 messages/second per phone number
  - 200,000 messages/day per business account

### Instagram Limits

- **Rate Limits**: 
  - 100 requests/hour per user
  - 200 requests/hour per page
- **Message Types**: Only text, media, quick replies, and generic templates
- **No Template Approval**: Unlike WhatsApp, no template pre-approval needed
- **24-Hour Window**: Can only reply within 24h of user's last message (unless using One-Time Notification)

---

## Part 5: Troubleshooting

### Webhook Not Receiving Messages

1. **Check ngrok**: Ensure ngrok is running and URL is correct
2. **Check Verify Token**: Must match exactly in both `.env.local` and Meta dashboard
3. **Check Subscriptions**: Ensure `messages` field is subscribed in webhook settings
4. **Check Logs**: Look at terminal output for errors
5. **Test Webhook**: Use Meta's "Test" button in webhook configuration

### Messages Not Sending

1. **Check Access Token**: Ensure it's valid and not expired
2. **Check Phone Number ID**: Must be the correct Phone Number ID (not the actual number)
3. **Check Recipient Format**: 
   - WhatsApp: No `+` sign, just country code + number (e.g., `1234567890`)
   - Instagram: Must be the IGSID from webhook, not username
4. **Check 24-Hour Window**: For session messages, must reply within 24h
5. **Check API Response**: Log the full error response for details

### Common Errors

| Error Code | Description | Solution |
|------------|-------------|----------|
| `(#131030)` | Recipient not in approved list | Add number to test recipients or use production access |
| `(#131042)` | Template not found | Ensure template is approved and name matches exactly |
| `(#131047)` | Re-engagement message not allowed | User hasn't messaged you in 24h, use template instead |
| `(#190)` | Access token expired | Generate new token or use system user token |
| `(#100)` | Invalid parameter | Check request payload format |

---

## Part 6: Best Practices

### Security

- ✅ **Never commit** `.env.local` to git
- ✅ **Use System User Tokens** for production (never expire)
- ✅ **Verify Webhook Signatures** (not implemented yet, TODO)
- ✅ **Validate Input** from webhooks before processing
- ✅ **Rate Limit** your API to avoid hitting Meta limits

### Performance

- ✅ **Return 200 immediately** from webhooks (process async)
- ✅ **Use queues** for high-volume message sending (Redis, BullMQ)
- ✅ **Cache** user profiles and conversation data
- ✅ **Batch** database writes when possible

### User Experience

- ✅ **Send typing indicators** before generating AI responses
- ✅ **Mark messages as read** when you process them
- ✅ **Use templates** for common messages (faster and more reliable)
- ✅ **Respect opt-outs** - don't spam users
- ✅ **Provide opt-out mechanism** in your messages

### Compliance

- ✅ **Get user consent** before sending marketing messages
- ✅ **Respect GDPR/CCPA** - allow users to delete their data
- ✅ **Follow Meta policies** - https://www.whatsapp.com/legal/business-policy
- ✅ **Don't send prohibited content** (spam, adult, illegal content)

---

## Part 7: Next Steps

Now that webhooks are set up, you can:

1. **Implement AI Auto-Reply**: Use OpenAI to generate responses
2. **Create Workflows**: Trigger automated workflows on new messages
3. **Add CRM Features**: Track customer interactions, add tags, etc.
4. **Build Analytics**: Measure response times, conversation volumes, etc.
5. **Add Team Features**: Assign conversations to agents, internal notes, etc.

See the main project README for more information on these features.

---

## Resources

- WhatsApp Cloud API Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
- Instagram Messaging API Docs: https://developers.facebook.com/docs/messenger-platform/instagram
- Meta Business Help Center: https://www.facebook.com/business/help
- Ngrok Documentation: https://ngrok.com/docs
- Firebase Documentation: https://firebase.google.com/docs

---

## Support

If you encounter issues:

1. Check Meta's Status Dashboard: https://developers.facebook.com/status
2. Review Meta's Error Codes: https://developers.facebook.com/docs/whatsapp/cloud-api/support/error-codes
3. Ask in Meta Developer Community: https://developers.facebook.com/community
4. Check project Issues on GitHub

---

**Last Updated**: January 2025
