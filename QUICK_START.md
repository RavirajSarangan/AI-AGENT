# 🚀 Quick Start Guide - AI Agent Platform

Get your AI-powered customer engagement platform running in 15 minutes!

---

## Prerequisites

- Node.js 18+ installed
- Firebase account (free tier works)
- Meta Business Account (for WhatsApp/Instagram)
- OpenAI API key (for AI replies)
- ngrok installed (for local webhook testing)

---

## Step 1: Clone & Install (2 minutes)

```bash
# Navigate to project directory
cd /Users/venomxtechnology/Pictures/AIAGENT

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

---

## Step 2: Configure Firebase (3 minutes)

1. Go to https://console.firebase.google.com
2. Create a new project (or use existing)
3. Enable **Authentication** > Sign-in method > Email/Password & Google
4. Enable **Firestore Database** > Create database in production mode
5. Go to **Project Settings** > Copy the config

Add to `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc123
```

---

## Step 3: Configure OpenAI (2 minutes)

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Add billing information (required for API access)

Add to `.env.local`:
```env
OPENAI_API_KEY=sk-proj-your_key_here
OPENAI_MODEL=gpt-4-turbo
```

---

## Step 4: Run the App (1 minute)

```bash
# Start development server
npm run dev

# Open browser
# Visit: http://localhost:3000
```

**You should see:** The login page

---

## Step 5: Create Account (1 minute)

1. Click "Sign Up"
2. Enter email and password (or use Google)
3. You'll be logged in as "admin" role automatically
4. Create your first workspace

**You should see:** The admin dashboard

---

## Step 6: Set Up Webhooks (5 minutes)

### 6A. Start ngrok:

```bash
# In a new terminal
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

### 6B. Configure WhatsApp:

1. Go to https://developers.facebook.com/apps
2. Create app > Business type
3. Add "WhatsApp" product
4. Go to WhatsApp > Configuration > Webhook
5. **Callback URL:** `https://abc123.ngrok.io/api/webhooks/whatsapp`
6. **Verify Token:** `your_custom_verify_token_123` (choose any string)
7. Subscribe to `messages` field
8. Copy **Phone Number ID** and **Access Token**

Add to `.env.local`:
```env
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_VERIFY_TOKEN=your_custom_verify_token_123
```

### 6C. Configure Instagram (Optional):

1. In same Meta App, add "Messenger" product
2. Connect Instagram Business Account
3. Go to Messenger > Settings > Webhooks
4. **Callback URL:** `https://abc123.ngrok.io/api/webhooks/instagram`
5. **Verify Token:** `your_custom_verify_token_456`
6. Subscribe to `messages` field
7. Copy **Page ID** and **Access Token**

Add to `.env.local`:
```env
INSTAGRAM_PAGE_ID=your_page_id
INSTAGRAM_ACCESS_TOKEN=your_page_access_token
INSTAGRAM_VERIFY_TOKEN=your_custom_verify_token_456
```

---

## Step 7: Create Your First Workflow (1 minute)

1. In the app, go to **Workflows** (sidebar)
2. Click "Create Workflow"
3. Name it "Auto-Reply Workflow"
4. Click "Builder"
5. Drag these nodes from left panel:
   - **Trigger:** "Message Received"
   - **Response:** "AI Reply"
6. **Connect them:** Drag from circle on Message Received to AI Reply
7. Click **Save**
8. Toggle workflow to **Active**

---

## Step 8: Test It! (2 minutes)

1. Send a message to your WhatsApp test number
   - Use WhatsApp app on your phone
   - Message your Meta test number (found in WhatsApp > API Setup)

2. Watch the magic happen:
   - ✅ Terminal logs show webhook received
   - ✅ Contact auto-created in Firestore
   - ✅ Conversation auto-created
   - ✅ Workflow triggered
   - ✅ AI reply generated
   - ✅ Reply sent back to WhatsApp

3. Check the app:
   - Go to **Conversations** - you should see your message
   - Go to **Contacts** - you should see yourself as a contact
   - Go to **Workflows** > Your workflow > **Logs** - execution log

4. Check your phone:
   - You should receive an AI-generated reply!

---

## 🎉 Congratulations!

You now have a fully functional AI-powered customer engagement platform!

---

## What You Can Do Now

### 1. **Explore the Inbox**
- Go to **Conversations**
- See the 3-panel layout (list, messages, contact info)
- Send a reply manually
- Try the AI Pause toggle
- Add tags to the contact

### 2. **Build Complex Workflows**
- Go to **Workflows** > **Builder**
- Try adding conditions: "If Contains" keyword
- Add actions: "Add Tag", "Assign to Agent"
- Connect multiple nodes
- Test different paths

### 3. **Manage Contacts**
- Go to **Contacts**
- Click on a contact
- Edit their information
- Add notes
- See conversation history

### 4. **View Analytics**
- Go to **Analytics**
- See message volume charts
- Check workflow success rates
- Monitor response times

### 5. **Configure Settings**
- Go to **Settings**
- Set up business hours
- Configure AI prompts
- Manage team members
- Set up billing

---

## Common Issues & Fixes

### Issue: Webhook not receiving messages

**Fix:**
1. Check ngrok is running: `ngrok http 3000`
2. Verify webhook URL in Meta dashboard matches ngrok URL
3. Check verify token matches `.env.local`
4. Look for errors in terminal

### Issue: AI reply not sending

**Fix:**
1. Check OpenAI API key is valid
2. Check you have billing set up on OpenAI
3. Look for errors in terminal
4. Check workflow is "Active"

### Issue: Messages not appearing in inbox

**Fix:**
1. Check Firebase Firestore has data
2. Verify you're logged in as correct user
3. Check browser console for errors
4. Refresh the page

---

## Next Steps

### Recommended Setup:

1. **Invite Team Members:**
   - Go to Settings > Team
   - Add admins and agents
   - They get email invitations

2. **Create Templates:**
   - Go to Templates
   - Create common responses
   - Use variables: {{name}}, {{order_id}}

3. **Set Business Hours:**
   - Go to Settings > Business Hours
   - Define when AI should auto-reply
   - Set after-hours message

4. **Production Deployment:**
   - Deploy to Vercel: `vercel deploy`
   - Update webhook URLs to production domain
   - Request Meta advanced access
   - Set up monitoring (Sentry)

---

## Resources

- **Full Documentation:** `IMPLEMENTATION_COMPLETE.md`
- **Webhook Setup:** `docs/WEBHOOK_SETUP.md`
- **Implementation Status:** `IMPLEMENTATION_STATUS.md`
- **Meta WhatsApp Docs:** https://developers.facebook.com/docs/whatsapp/cloud-api
- **OpenAI Docs:** https://platform.openai.com/docs

---

## Support

Need help? Check these resources:

1. **Meta Developer Community:** https://developers.facebook.com/community
2. **OpenAI Community:** https://community.openai.com
3. **Firebase Docs:** https://firebase.google.com/docs
4. **React Flow Docs:** https://reactflow.dev/docs

---

## Production Checklist

Before going live:

- [ ] Deploy to production (Vercel/AWS/Google Cloud)
- [ ] Update all webhook URLs to production domain
- [ ] Generate permanent access tokens (System User Tokens)
- [ ] Request Meta advanced access for Instagram
- [ ] Set up error monitoring (Sentry)
- [ ] Configure rate limiting
- [ ] Set up database backups
- [ ] Test all workflows thoroughly
- [ ] Train team on platform usage
- [ ] Create runbook for common issues

---

**Time to First Message:** ~15 minutes  
**Time to Production:** ~1 day (including Meta approval)

**Built with ❤️ for amazing customer experiences!**
