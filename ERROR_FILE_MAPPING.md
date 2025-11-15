# TypeScript Errors - File Mapping Reference

## Files with Errors (9 total)

### 1. app/(admin)/templates/page.tsx
**Severity:** CRITICAL + MEDIUM
**Error Count:** 4 errors
**Lines:** 45, 54, 58, 134, 137

| Line | Error | Type | Fix |
|------|-------|------|-----|
| 45 | Missing export 'Template' | TS2305 | Change to `MessageTemplate` |
| 54 | Type reference 'Template' | TYPE | Change to `MessageTemplate[]` |
| 58 | Type reference 'Template' | TYPE | Change to `MessageTemplate \| null` |
| 134 | Category type mismatch | TS2345 | Add `status`, `tenant_id`, `language`, `channels`, `created_by` |
| 137 | Missing template fields | TS2345 | Same as line 134 |

**Related Files:**
- `/Users/venomxtechnology/Pictures/AIAGENT/lib/firebase/templates.ts` (exports MessageTemplate)

---

### 2. app/(admin)/conversations/page.tsx
**Severity:** HIGH
**Error Count:** 4 errors
**Lines:** 77, 80, 97, 138

| Line | Error | Type | Fix |
|------|-------|------|-----|
| 77 | Property 'current_tenant' | TS2551 | Change to `currentTenant` |
| 80 | Property 'current_tenant' | TS2551 | Change to `currentTenant` |
| 97 | Property 'current_tenant' | TS2551 | Change to `currentTenant` |
| 138 | Property 'name' | TS2339 | Change to `displayName` |

**Related Files:**
- `/Users/venomxtechnology/Pictures/AIAGENT/lib/firebase/users.ts` (UserProfile interface)
- `/Users/venomxtechnology/Pictures/AIAGENT/contexts/AuthContext.tsx` (useAuth hook)

**UserProfile Reference:**
```typescript
interface UserProfile {
  uid: string;
  email: string;
  displayName: string;  // Use this, not "name"
  currentTenant: string;  // Use this, not "current_tenant"
  // ...
}
```

---

### 3. app/(admin)/simulator/page.tsx
**Severity:** CRITICAL + HIGH
**Error Count:** 4 errors
**Lines:** 80, 88, 112, 129

| Line | Error | Type | Fix |
|------|-------|------|-----|
| 80 | Expected 1 args, got 2 | TS2554 | Move tenantId to contact object |
| 88 | Missing properties | TS2352 | Add `custom_fields`, `last_contacted` |
| 112 | Expected 1 args, got 2 | TS2554 | Check createConversation signature |
| 129 | Expected 1 args, got 2 | TS2554 | Check sendMessage signature |

**Related Files:**
- `/Users/venomxtechnology/Pictures/AIAGENT/lib/firebase/contacts.ts` (createContact function)
- `/Users/venomxtechnology/Pictures/AIAGENT/lib/firebase/conversations.ts` (createConversation, sendMessage)

**Function Signatures:**
```typescript
// contacts.ts
export const createContact = async (
  contact: Omit<Contact, "id" | "created_at" | "updated_at">
) => { ... }

// Correct usage
createContact({
  tenant_id: userProfile.currentTenant,
  name,
  // ...
  tags: [],
  custom_fields: {},
})
```

---

### 4. app/(admin)/dashboard/page.tsx
**Severity:** MEDIUM
**Error Count:** 2 errors
**Lines:** 60, 88

| Line | Error | Type | Fix |
|------|-------|------|-----|
| 60 | Arithmetic with Date\|Timestamp | TS2363 | Add type guard for Timestamp |
| 88 | Date constructor with Date\|Timestamp | TS2769 | Convert Timestamp to Date first |

**Related Files:**
- `/Users/venomxtechnology/Pictures/AIAGENT/lib/firebase/conversations.ts` (Conversation with Date\|Timestamp)
- `/Users/venomxtechnology/Pictures/AIAGENT/lib/firebase/execution-logs.ts` (ExecutionLog)

**Timestamp Handling Helper:**
```typescript
// Create this utility
const toDate = (value: Date | Timestamp | undefined): Date | null => {
  if (!value) return null;
  return value instanceof Date ? value : value.toDate();
}
```

---

### 5. app/(admin)/settings/hours/page.tsx
**Severity:** HIGH
**Error Count:** 2 errors
**Lines:** 29, 30

| Line | Error | Type | Fix |
|------|-------|------|-----|
| 29 | Property 'only_during_hours' | TS2339 | Use `allow_ai_outside_hours` instead |
| 30 | Property 'auto_respond_outside' | TS2339 | Use `allow_ai_outside_hours` instead |

**Related Files:**
- `/Users/venomxtechnology/Pictures/AIAGENT/lib/firebase/settings.ts` (BusinessHours interface)

**BusinessHours Reference:**
```typescript
interface BusinessHours {
  enabled: boolean;
  schedule: Array<{...}>;
  out_of_hours_message: string;
  allow_ai_outside_hours: boolean;  // Use this property
}
```

---

### 6. app/(admin)/settings/whatsapp/page.tsx
**Severity:** HIGH
**Error Count:** 4 errors
**Lines:** 34, 36, 38, 51

| Line | Error | Type | Fix |
|------|-------|------|-----|
| 34 | Property 'business_account_id' | TS2339 | Use `waba_id` instead |
| 36 | Property 'app_secret' | TS2339 | Not in interface, remove or refactor |
| 38 | Property 'webhook_url' | TS2339 | Not in interface, remove or refactor |
| 51 | Invalid object literal | TS2353 | Update with correct property names |

**Related Files:**
- `/Users/venomxtechnology/Pictures/AIAGENT/lib/firebase/settings.ts` (WhatsAppSettings)

**WhatsAppSettings Reference:**
```typescript
interface WhatsAppSettings {
  connected: boolean;
  phone_number?: string;
  phone_number_id?: string;
  waba_id?: string;  // Use this, not business_account_id
  access_token?: string;
  verify_token?: string;
  // No app_secret or webhook_url
}
```

---

### 7. app/(admin)/workflows/[id]/builder/page.tsx
**Severity:** MEDIUM
**Error Count:** 1 error
**Line:** 214

| Line | Error | Type | Fix |
|------|-------|------|-----|
| 214 | Expected 1 args, got 2 | TS2554 | Check createWorkflow signature |

**Related Files:**
- `/Users/venomxtechnology/Pictures/AIAGENT/lib/firebase/workflows.ts` (createWorkflow)

---

### 8. app/(admin)/workflows/builder/page.backup.tsx
**Severity:** MEDIUM
**Error Count:** 9 errors
**Lines:** 355, 356, 558, 561, 562, 566, 569, 571

| Line | Error | Type | Fix |
|------|-------|------|-----|
| All | Cannot find names (doc, db, etc) | TS2304 | Add Firebase imports OR delete backup file |

**RECOMMENDATION:** Delete this file (it's a backup)

**Alternative:** Add these imports:
```typescript
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
```

---

### 9. app/(admin)/workflows/page.old.tsx
**Severity:** MEDIUM
**Error Count:** 4 errors
**Lines:** 212, 232, 268

| Line | Error | Type | Fix |
|------|-------|------|-----|
| 212 | Cannot find 'workflowList' | TS2552 | Change to `workflows` OR delete file |
| 232 | Cannot find 'formatTime' | TS2304 | Import/define OR delete file |
| 268 | Cannot find 'duplicateWorkflow' | TS2304 | Import/define OR delete file |

**RECOMMENDATION:** Delete this file (it's old/unused)

---

## Summary by Error Type

### TS2305: Module has no exported member
- templates/page.tsx:45 - Missing `Template` export (should be `MessageTemplate`)

### TS2551: Property does not exist
- conversations/page.tsx:77,80,97 - `current_tenant` doesn't exist (use `currentTenant`)

### TS2339: Property does not exist
- conversations/page.tsx:138 - `name` doesn't exist (use `displayName`)
- settings/hours/page.tsx:29,30 - Properties don't exist in BusinessHours
- settings/whatsapp/page.tsx:34,36,38 - Properties don't exist in WhatsAppSettings

### TS2345: Argument not assignable to parameter
- templates/page.tsx:134,137 - Object missing required properties

### TS2352: Conversion may be a mistake
- simulator/page.tsx:88 - Missing Contact properties

### TS2363: Arithmetic with wrong type
- dashboard/page.tsx:60 - Can't do arithmetic with Date | Timestamp

### TS2554: Expected 1 arguments, but got 2
- simulator/page.tsx:80,112,129 - Function signature mismatch
- workflows/[id]/builder/page.tsx:214 - Function signature mismatch

### TS2769: No overload matches
- dashboard/page.tsx:88 - Date constructor with Date | Timestamp

### TS2304: Cannot find name
- workflows/builder/page.backup.tsx:355,356,558,561,562,566,569,571 - Missing imports
- workflows/page.old.tsx:212,232,268 - Missing definitions

### TS2552: Cannot find name (similar to above)
- workflows/page.old.tsx:212 - Undefined variable

---

## Interface Reference Map

### UserProfile (lib/firebase/users.ts)
- Used by: conversations/page.tsx
- Properties:
  - `uid: string`
  - `email: string`
  - `displayName: string` (not "name")
  - `currentTenant: string` (not "current_tenant")
  - `role: UserRole`
  - `tenants: string[]`
  - etc.

### Contact (lib/firebase/contacts.ts)
- Used by: simulator/page.tsx
- Required properties:
  - `tenant_id: string`
  - `name: string`
  - `channel: "whatsapp" | "instagram" | "both"`
  - `tags: string[]`
  - `custom_fields: Record<string, any>`
  - `last_contacted: Date | Timestamp`
  - `conversation_count: number`
  - `created_at: Date | Timestamp`
  - `updated_at: Date | Timestamp`

### MessageTemplate (lib/firebase/templates.ts)
- Used by: templates/page.tsx
- Properties:
  - `id: string`
  - `tenant_id: string`
  - `name: string`
  - `category: "greeting" | "sales" | "support" | "marketing" | "custom"`
  - `content: string`
  - `status: "active" | "draft"`
  - `language: string`
  - `channels: ("whatsapp" | "instagram")[]`
  - `created_by: string`
  - etc.

### BusinessHours (lib/firebase/settings.ts)
- Used by: settings/hours/page.tsx
- Properties:
  - `enabled: boolean`
  - `schedule: Array<{...}>`
  - `out_of_hours_message: string`
  - `allow_ai_outside_hours: boolean` (not separate properties)

### WhatsAppSettings (lib/firebase/settings.ts)
- Used by: settings/whatsapp/page.tsx
- Properties:
  - `waba_id?: string` (not "business_account_id")
  - `phone_number_id?: string`
  - `access_token?: string`
  - `verify_token?: string`
  - (no "app_secret" or "webhook_url")

---

## Quick Navigation

**To fix each file, go to:**
1. Templates: line 45, then lines 54, 58, 134, 137
2. Conversations: lines 77, 80, 97, 138
3. Simulator: lines 80, 88, 112, 129
4. Dashboard: lines 60, 88
5. Hours Settings: lines 29, 30
6. WhatsApp Settings: lines 34, 36, 38, 51
7. Workflows Builder: line 214
8. Workflows Backup: RECOMMEND DELETION
9. Workflows Old: RECOMMEND DELETION
