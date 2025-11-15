# 🔐 Role-Based Access Control (RBAC) Implementation Guide

## Overview

FlowReplyAI now includes a complete role-based access control system with three user roles, multi-workspace support, and secure authentication via Firebase.

## 📋 User Roles

### 1. **Platform Owner** (`owner`)
- **Dashboard:** `/owner-dashboard`
- **Full system access across all workspaces**
- **Capabilities:**
  - View system-wide analytics
  - Manage all tenant workspaces
  - Monitor platform health
  - Access billing and revenue metrics
  - Create/delete workspaces
  - All admin capabilities

### 2. **Business Admin** (`admin`)
- **Dashboard:** `/dashboard`
- **Full workspace access**
- **Capabilities:**
  - Manage workflows (create, edit, delete)
  - View and reply to conversations
  - Manage team members (invite, remove, change roles)
  - Configure AI settings
  - Connect WhatsApp/Instagram
  - Manage business hours
  - View billing and usage
  - Access all workspace settings

### 3. **Agent** (`agent`)
- **Dashboard:** `/agent-dashboard`
- **Limited workspace access (customer support)**
- **Capabilities:**
  - View and reply to conversations
  - View contact list
  - View workflow execution logs (read-only)
- **Restrictions:**
  - ❌ Cannot create or edit workflows
  - ❌ Cannot access settings
  - ❌ Cannot manage billing
  - ❌ Cannot invite team members

## 🏗️ Implementation Details

### File Structure

```
lib/firebase/users.ts              # User profile & role management
contexts/AuthContext.tsx            # Authentication with role support
components/auth/RoleGuard.tsx       # Role-based route protection
components/workspace/WorkspaceSwitcher.tsx  # Multi-workspace switching
app/(admin)/dashboard/page.tsx      # Admin dashboard
app/(admin)/owner-dashboard/page.tsx # Owner dashboard
app/(admin)/agent-dashboard/page.tsx # Agent dashboard
```

### Database Schema

#### `users` Collection
```typescript
{
  uid: string;                    // Firebase Auth UID
  email: string;
  displayName: string;
  role: "owner" | "admin" | "agent";
  tenants: string[];              // Array of tenant_ids user has access to
  currentTenant: string;          // Active workspace tenant_id
  photoURL?: string;
  phoneNumber?: string;
  jobTitle?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}
```

#### `tenant_members` Collection
```typescript
{
  id: `${tenant_id}_${uid}`;      // Composite ID
  tenant_id: string;
  uid: string;
  email: string;
  displayName: string;
  role: "owner" | "admin" | "agent";
  photoURL?: string;
  lastLogin?: Date;
  status: "active" | "invited" | "suspended";
  invitedAt?: Date;
  invitedBy?: string;
}
```

## 🚀 Usage Examples

### Protecting Routes with RoleGuard

```tsx
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function AdminPage() {
  return (
    <RoleGuard allowedRoles={["admin", "owner"]}>
      <div>Admin-only content</div>
    </RoleGuard>
  );
}
```

### Accessing User Profile & Role

```tsx
import { useAuth } from "@/contexts/AuthContext";

export default function MyComponent() {
  const { user, userProfile } = useAuth();

  return (
    <div>
      <p>Name: {userProfile?.displayName}</p>
      <p>Role: {userProfile?.role}</p>
      <p>Workspace: {userProfile?.currentTenant}</p>
    </div>
  );
}
```

### Workspace Switching

```tsx
import { WorkspaceSwitcher } from "@/components/workspace/WorkspaceSwitcher";

export default function Dashboard() {
  return (
    <div>
      <WorkspaceSwitcher />
      {/* Rest of dashboard */}
    </div>
  );
}
```

### Checking Permissions

```tsx
import { checkPermission } from "@/lib/firebase/users";

// Check if user can edit workflows
const canEdit = await checkPermission(
  userId,
  tenantId,
  ["owner", "admin"]
);

if (canEdit) {
  // Show edit button
}
```

## 🔄 Workflow: User Signup → Workspace Creation

1. User signs up via `/signup` or Google OAuth
2. `createUserProfile()` automatically called with:
   - New `tenant_id` generated: `tenant-${timestamp}`
   - User role set to `admin` (default)
   - User added to `users` collection
   - User added to `tenant_members` collection
3. User redirected to `/dashboard`
4. WorkspaceSwitcher displays current workspace
5. User can invite team members with different roles

## 👥 Team Management

### Invite Team Member

```typescript
import { inviteMemberToTenant } from "@/lib/firebase/users";

await inviteMemberToTenant(
  "tenant-123",
  "agent@example.com",
  "agent",
  currentUserId
);
```

### Update Member Role

```typescript
import { updateMemberRole } from "@/lib/firebase/users";

await updateMemberRole("tenant-123", "user-456", "admin");
```

### Remove Team Member

```typescript
import { removeMemberFromTenant } from "@/lib/firebase/users";

await removeMemberFromTenant("tenant-123", "user-456");
```

## 🔒 Security Rules (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles - only owner can read/write
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Tenant members - workspace admins can manage
    match /tenant_members/{memberDoc} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/tenant_members/$(resource.data.tenant_id + '_' + request.auth.uid)).data.status == 'active';
      
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/tenant_members/$(resource.data.tenant_id + '_' + request.auth.uid)).data.role in ['owner', 'admin'];
    }
    
    // Workflows - only admins and owners can edit
    match /workflows/{workflowId} {
      allow read: if request.auth != null;
      
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/tenant_members/$(resource.data.tenant_id + '_' + request.auth.uid)).data.role in ['owner', 'admin'];
    }
  }
}
```

## 📊 Role-Based UI Features

### Header Component
- Displays current workspace name
- Shows user role badge (Owner/Admin/Agent)
- Real-time role indicator with color coding:
  - **Owner:** Purple badge
  - **Admin:** Gray badge
  - **Agent:** Outline badge

### Sidebar Navigation
- Dynamically hides/shows menu items based on role
- Agents cannot see:
  - Workflows (edit)
  - Settings
  - Billing
  - Team

### Dashboard Views
- **Owner Dashboard:** System-wide metrics, workspace list, health monitoring
- **Admin Dashboard:** Workspace analytics, KPIs, workflow performance
- **Agent Dashboard:** Assigned conversations, pending replies, quick actions

## 🧪 Testing Roles

### Create Test Users

```bash
# Owner account
Email: owner@flowreplyai.com
Role: owner
Workspaces: All

# Admin account
Email: admin@company.com
Role: admin
Workspaces: ["tenant-1"]

# Agent account
Email: agent@company.com
Role: agent
Workspaces: ["tenant-1"]
```

### Test Scenarios

1. **Owner Login:**
   - Visit `/owner-dashboard`
   - Should see all workspaces
   - Can switch between any workspace

2. **Admin Login:**
   - Visit `/dashboard`
   - Can manage workflows, settings, team
   - Can switch between assigned workspaces

3. **Agent Login:**
   - Redirected to `/agent-dashboard`
   - Can only view conversations and contacts
   - Cannot access `/workflows`, `/settings`, `/billing`

## 🔧 Environment Setup

No additional environment variables needed. Uses existing Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## 📚 API Reference

### User Management Functions

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `createUserProfile()` | uid, email, displayName, role, tenantId | Promise\<UserProfile\> | Creates user profile and adds to tenant |
| `getUserProfile()` | uid | Promise\<UserProfile \| null\> | Fetches user profile |
| `subscribeToUserProfile()` | uid, callback | Unsubscribe function | Real-time user profile updates |
| `switchWorkspace()` | uid, tenantId | Promise\<void\> | Switches active workspace |
| `updateLastLogin()` | uid | Promise\<void\> | Updates last login timestamp |
| `getTenantMembers()` | tenantId | Promise\<TenantMember[]\> | Gets all members in workspace |
| `subscribeToTenantMembers()` | tenantId, callback | Unsubscribe function | Real-time tenant members updates |
| `updateMemberRole()` | tenantId, uid, role | Promise\<void\> | Updates member role |
| `removeMemberFromTenant()` | tenantId, uid | Promise\<void\> | Removes member from workspace |
| `inviteMemberToTenant()` | tenantId, email, role, invitedByUid | Promise\<string\> | Sends invitation |
| `checkPermission()` | uid, tenantId, requiredRoles | Promise\<boolean\> | Checks if user has permission |

## 🎯 Next Steps

1. **Email Invitations:** Implement actual email sending for team invites
2. **2FA:** Add two-factor authentication support
3. **Audit Logs:** Track all role changes and permission updates
4. **Advanced Permissions:** Granular permissions per feature (e.g., view-only workflows)
5. **SSO:** Add SAML/OAuth for enterprise customers
6. **API Keys:** Generate API keys with role-based scopes

## 📖 Related Documentation

- [MASTER_PROMPT.md](./MASTER_PROMPT.md) - Complete system overview
- [README.md](./README.md) - Project documentation
- [SETUP.md](./SETUP.md) - Firebase setup guide

---

**Last Updated:** November 15, 2025
**Version:** 1.0.0
