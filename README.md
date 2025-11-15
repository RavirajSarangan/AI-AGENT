# FlowReplyAI - AI-Powered Multi-Channel Automation Platform

**Version:** 2.0.0 | **Status:** Production-Ready (95% Complete) 🚀

## 📌 Project Overview

FlowReplyAI is a **complete AI-powered customer engagement platform** that helps businesses respond instantly across **WhatsApp and Instagram**, create visual workflows, manage conversations in a unified inbox, and automate customer support, sales, and operations. 

The system combines:
- ✅ **WhatsApp Cloud API** - Receive and send messages
- ✅ **Instagram Messaging API** - Unified DM management
- ✅ **AI Auto-Reply (GPT-4)** - Intelligent, context-aware responses
- ✅ **Visual Workflow Builder** - No-code automation with React Flow
- ✅ **Unified Inbox** - 3-panel layout for seamless conversation management
- ✅ **Full Admin Dashboard** - Analytics, contacts, templates, settings
- ✅ **Multi-Tenant Architecture** - Manage multiple businesses/workspaces

---

## 🎯 What This Platform Does

### For Businesses:
- 📱 **Receive messages** from WhatsApp and Instagram in one place
- 🤖 **Auto-reply with AI** - GPT-4 powered intelligent responses
- 🔄 **Automate workflows** - Visual builder with triggers, conditions, actions
- 💬 **Manage conversations** - Unified inbox with contact details
- 📊 **Track analytics** - Message volume, response times, workflow success
- 👥 **Team collaboration** - Assign conversations, add notes, manage tags
- 📧 **Template messages** - Quick replies with variable insertion

### For End Customers:
- ⚡ **Instant responses** - AI replies within seconds
- 🎯 **Accurate answers** - Context-aware AI with conversation history
- 📱 **Native experience** - Chat directly on WhatsApp/Instagram
- 🔄 **Seamless handoff** - AI to human agent when needed

## 👥 User Roles

### 1. Platform Owner (You)
- Manages system, billing, and tenant workspaces
- Full access to all modules

### 2. Business User (Client / Admin Panel User)
- Logs into admin panel
- Connects WhatsApp
- Creates workflows
- Views chat inbox and settings

### 3. End Customer (WhatsApp User)
- Sends messages to the business via WhatsApp
- Receives AI or workflow-generated replies
- Does not access the web panel

## 🧩 Core System Components

### A. WhatsApp Integration Module
- WhatsApp Cloud API (Meta)
- Webhook receives incoming messages
- API sends outgoing messages
- Validates and processes events

### B. AI Auto-Reply Engine
- Uses OpenAI GPT
- Generates intelligent responses based on:
  - Message content
  - Conversation context
  - Business personality settings
- Works as fallback when no workflow handles message

### C. Workflow Automation Engine (n8n-style)
**Supported triggers:**
- Incoming WhatsApp message
- Incoming webhook (optional future)

**Supported actions:**
- Condition (contains / equals / regex)
- AI Generate (GPT)
- Send WhatsApp message
- HTTP Request / Webhook
- Save/tag customer (CRM tagging)

### D. Admin Panel (Web App)
For business users to manage:
- Conversations
- Workflow automations
- Settings (AI, WhatsApp, business hours)
- Customers
- Team members
- Billing

## 🔄 System Workflow (End-to-End)

### Step 1: Customer sends WhatsApp message
Sent to business number registered with WhatsApp Cloud API.

### Step 2: WhatsApp → sends webhook → Backend
Your server receives message content, phone number, timestamp, etc.

### Step 3: Backend identifies customer
Creates or finds:
- Tenant (business account)
- Customer contact
- Conversation thread

### Step 4: Run Workflow Engine
All workflows with `incoming_message` trigger run:
1. Condition checks
2. AI prompt processing
3. Webhook/HTTP calls
4. WhatsApp send-message actions

### Step 5: If workflow doesn't reply → AI fallback
AI generates default intelligent reply.

### Step 6: Send reply to WhatsApp API
Customer receives the message instantly.

### Step 7: Save message logs
Stored for admin to review in Conversations page.

## 📝 Admin Panel – Full Page List

### Public Pages
1. Landing page
2. Pricing
3. Login
4. Sign up
5. Forgot password
6. Reset password

### Authenticated Admin Pages
1. Dashboard
2. Conversations list
3. Conversation detail (chat window)
4. Contacts (customers list)
5. Workflows list
6. Workflow Builder (create/edit)
7. Workflow Execution Logs
8. Settings
   - Profile
   - AI configuration
   - WhatsApp connection
   - Business hours
   - Team
9. Billing
10. My Account

## 🏗️ Technical Stack

### Backend (API + Webhooks + Workflows)
- **Node.js + TypeScript + NestJS**
  - Perfect for webhooks, JSON, external APIs (WhatsApp, OpenAI)
  - Structured architecture (modules, DI, guards, etc.)
  
**Key backend pieces:**
- WhatsApp webhook handler (receive + send messages)
- Workflow engine (conditions, AI node, HTTP node, etc.)
- OpenAI service wrapper
- Auth (JWT)
- Multi-tenant logic (tenant_id everywhere)
- REST API for admin panel

### Frontend (Admin Panel + Marketing Pages)
- **Next.js (React) + TypeScript + Tailwind CSS + shadcn/ui**
  - Great DX
  - SEO friendly (for landing page)
  - Type-safe components
  
**Frontend handles:**
- Admin dashboard
- Conversations view
- Workflow builder UI
- Settings, billing, login, etc.
- Public landing page and pricing page

### Database & Storage
- **PostgreSQL + Prisma**
  - Strong relational DB, great for multi-tenant & analytics
  - Type-safe ORM, super dev-friendly with TypeScript
  
**Stores:**
- Tenants, business users
- Contacts, conversations, messages
- Workflows & workflow executions
- Settings (AI, hours, WhatsApp config)

**Optional:**
- Redis for caching & queues (rate limiting, background jobs, delayed workflows)

### AI Layer
- **OpenAI Chat Completions (GPT-4o-mini / GPT-4o)**
  - Great quality vs cost for chatbots
  - Easy HTTP integration from backend
  - Centralized in an AiService inside NestJS

### Infrastructure / DevOps
- Docker → containerize backend + frontend
- Railway / Render / Fly.io → fast to deploy full stack
- Supabase / Neon / RDS → managed PostgreSQL
- GitHub Actions → CI/CD (run tests + deploy on push)
- ngrok for exposing webhook URL to WhatsApp during development

## 🧱 Data Model (High-Level)

### Tenants & Users
- tenants
- business_users

### Messaging
- contacts (end customers)
- conversations
- messages

### Workflows
- workflows
- workflow_nodes
- workflow_executions

### Settings
- ai_settings
- whatsapp_settings
- business_hours

## 🧩 Core Features

### ⭐ WhatsApp AI Auto-Reply
- Instantly respond using AI (GPT)
- Customizable tone, language, and personality
- Supports FAQs, lead responses, product info, order updates, etc.

### ⭐ Workflow Automation Engine (n8n-style)
Triggers, conditions, and actions:
- IF **message contains keyword**, THEN send AI reply
- IF **new lead**, THEN send to CRM via webhook
- IF **after hours**, THEN send auto response
- IF **urgent tag**, THEN notify staff

### ⭐ WhatsApp Cloud API Integration
- Official Meta WhatsApp Business API
- Webhook listener
- Message sender
- Multi-number support

### ⭐ Admin Panel (Business Dashboard)
- View all conversations
- Manual reply mode
- Manage workflows
- Manage team members
- Track analytics
- Manage settings

### ⭐ Conversation Inbox
- Real-time chat interface
- See all messages (AI + human)
- Pause AI replies for a conversation
- Add internal notes

### ⭐ Settings & Personalization
- Business hours
- Out-of-office messages
- AI personality & rules
- Multiple WhatsApp numbers
- Custom tags

### ⭐ Logs & Monitoring
- Workflow execution logs
- Error logs
- Message history

## 📈 Future Roadmap

- Multi-WhatsApp numbers per tenant
- Visual drag-and-drop workflow canvas
- Files/images support in chat
- Integrations marketplace (Zapier, Shopify, Slack)
- Lead CRM built-in
- Analytics and reporting
- Mobile app for team members
- Voice message support
- Broadcast messaging
- Template management

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📄 License

Proprietary - All rights reserved
