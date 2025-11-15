# SonarQube Issues - Systematic Fix Plan

## Executive Summary

**Total Issues Identified:** 107 warnings (down from 206 original)
**Estimated Total Fix Time:** 6-8 hours
**Critical Blocking Issues:** 1 (Firebase Index)
**TypeScript Errors:** 1 (footer.tsx icon type)

---

## Issue Categories by Priority & Complexity

### PRIORITY 1: CRITICAL (BLOCKING) - Fix Immediately
**Estimated Time: 2-5 minutes**

#### 1.1 Firebase Index Missing
- **Rule:** Runtime Error (Blocking app functionality)
- **Impact:** Conversations page fails to load
- **Auto-fixable:** YES (1-click)
- **Files:** Firestore configuration
- **Effort:** 1 minute
- **Fix:**
  ```bash
  # Option 1: Click the auto-generated URL
  https://console.firebase.google.com/v1/r/project/bizboard-hj0sd/firestore/indexes?create_composite=...

  # Option 2: Deploy from code
  firebase deploy --only firestore:indexes
  ```

#### 1.2 TypeScript Compilation Error
- **Rule:** TS2604
- **Impact:** Build fails
- **Auto-fixable:** NO (Manual fix required)
- **Files:**
  - `/Users/venomxtechnology/Pictures/AIAGENT/components/public/footer.tsx` (line 77)
- **Effort:** 3 minutes
- **Issue:** JSX element type 'social.icon' does not have any construct or call signatures
- **Fix:** Already partially fixed with string check, but TypeScript still complains. Change social.icon type definition.

---

### PRIORITY 2: HIGH (CODE QUALITY) - Fix Today
**Estimated Time: 1.5-2 hours**

#### 2.1 Unused Imports (S1128)
- **Auto-fixable:** YES (ESLint --fix)
- **Files Affected:** 15
- **Effort:** 5 minutes (automated) + 10 minutes (verification)

**Files:**
1. `/Users/venomxtechnology/Pictures/AIAGENT/app/(admin)/workflows/new/page.tsx`
   - Lines 19-24: Dialog components (6 unused)
   - Lines 31, 39-44: Icons (7 unused)
   - Lines 46-50: Components and types (5 unused)
   - Total: 18 unused imports

2. `/Users/venomxtechnology/Pictures/AIAGENT/app/(admin)/settings/whatsapp/page.tsx`
   - Line 10 (estimated): Copy, Eye, EyeOff icons

**Fix Command:**
```bash
# Auto-fix unused imports
npx eslint . --ext .ts,.tsx --fix

# Manual verification after auto-fix
npm run lint
```

#### 2.2 Unused Variables (S1854)
- **Rule:** Useless variable assignments
- **Auto-fixable:** PARTIAL (prefix with underscore or remove)
- **Files Affected:** 12
- **Effort:** 20 minutes

**Files:**
1. `/Users/venomxtechnology/Pictures/AIAGENT/app/(admin)/owner-dashboard/page.tsx`
   - Line 27: `loading` state unused
   - **Fix:** Remove or prefix with `_loading`

2. `/Users/venomxtechnology/Pictures/AIAGENT/app/(admin)/owner/analytics/page.tsx`
   - Line 44: `loading` state unused
   - **Fix:** Remove or prefix with `_loading`

3. `/Users/venomxtechnology/Pictures/AIAGENT/app/(admin)/owner/logs/page.tsx`
   - Line 54: `error` in catch block unused
   - **Fix:** Prefix with `_error` or add console.error

4. `/Users/venomxtechnology/Pictures/AIAGENT/app/(admin)/settings/billing/page.tsx`
   - Line 25: `TENANT_ID` unused
   - Line 145: `newPlan` parameter unused
   - **Fix:** Prefix with underscore or remove

5. `/Users/venomxtechnology/Pictures/AIAGENT/app/(admin)/settings/instagram/page.tsx`
   - Line 5: `TENANT_ID` unused
   - **Fix:** Prefix with underscore or remove

6. `/Users/venomxtechnology/Pictures/AIAGENT/app/(admin)/settings/whatsapp/page.tsx`
   - Line 14: `saving` state unused
   - Line 19: `appSecret` state unused
   - Line 21: `webhookUrl` state unused
   - Line 41: `handleSave` function unused
   - Line 58: `copyToClipboard` function unused
   - Line 70: `isConnected` function unused
   - **Fix:** Either implement functionality or remove

7. `/Users/venomxtechnology/Pictures/AIAGENT/app/(admin)/workflows/builder/page.tsx`
   - Line 126: `setRightPanelExpanded` unused
   - **Fix:** Either use it or remove state

8. `/Users/venomxtechnology/Pictures/AIAGENT/app/page.tsx`
   - Line 136: `fadeIn` animation variant unused
   - **Fix:** Remove or implement

9. `/Users/venomxtechnology/Pictures/AIAGENT/hooks/use-toast.ts`
   - Line 21: `actionTypes` only used as type
   - **Fix:** Add `type` keyword before declaration

**Quick Fix for Catch Blocks:**
```typescript
// Before
} catch (error) {
  // Empty or unused
}

// After
} catch (error) {
  console.error('Operation failed:', error);
}
```

#### 2.3 TODO Comments (S1135)
- **Auto-fixable:** NO (Requires implementation)
- **Count:** 23 TODOs across 10 files
- **Effort:** 2-4 hours (depends on implementation complexity)

**Critical TODOs (Must Implement):**

1. **Conversations Real-time Updates** (HIGH PRIORITY)
   - `/Users/venomxtechnology/Pictures/AIAGENT/app/(admin)/conversations/[id]/page.tsx`
   - Lines 127, 156, 164, 172, 182, 190, 198
   - **Action:** Implement Firestore listeners and API calls
   - **Effort:** 1 hour

2. **Webhook Processing** (HIGH PRIORITY)
   - `/Users/venomxtechnology/Pictures/AIAGENT/app/api/webhooks/stripe/route.ts`
   - Lines 42, 53, 61, 69, 77 (5 TODOs)
   - **Action:** Implement database updates for Stripe events
   - **Effort:** 45 minutes

3. **WhatsApp Webhook** (MEDIUM PRIORITY)
   - `/Users/venomxtechnology/Pictures/AIAGENT/app/api/webhooks/whatsapp/route.ts`
   - Lines 118, 267
   - **Action:** Implement tenant lookup and contact fetching
   - **Effort:** 30 minutes

**Low Priority TODOs (Can Convert to Issues):**
4. `/Users/venomxtechnology/Pictures/AIAGENT/lib/firebase/users.ts` (line 227) - Email invitation
5. `/Users/venomxtechnology/Pictures/AIAGENT/app/(admin)/workflows/page.tsx` (line 44) - Get tenantId from auth
6. `/Users/venomxtechnology/Pictures/AIAGENT/app/(admin)/workflows/builder/page.tsx` (line 310) - Get tenantId from auth
7. `/Users/venomxtechnology/Pictures/AIAGENT/app/(admin)/owner/settings/page.tsx` (line 26) - Save to Firestore
8. `/Users/venomxtechnology/Pictures/AIAGENT/app/(admin)/workflows/new/page.tsx` (line 117) - Save to Firestore
9. `/Users/venomxtechnology/Pictures/AIAGENT/app/(admin)/owner/analytics/page.tsx` (line 56) - Replace mock data
10. `/Users/venomxtechnology/Pictures/AIAGENT/app/api/webhooks/instagram/route.ts` (line 131) - Fetch Instagram profile

**Recommendation:** Convert low-priority TODOs to GitHub issues instead of inline comments.

#### 2.4 React Keys Using Index (Best Practice)
- **Auto-fixable:** NO (Manual fix required)
- **Count:** 8 files
- **Effort:** 20 minutes

**Files:**
1. `/Users/venomxtechnology/Pictures/AIAGENT/app/(admin)/agent-dashboard/page.tsx` (line 148)
2. `/Users/venomxtechnology/Pictures/AIAGENT/app/(admin)/analytics/page.tsx` (lines 245, 253, 308)
3. `/Users/venomxtechnology/Pictures/AIAGENT/app/(admin)/dashboard/page.tsx` (line 216)
4. `/Users/venomxtechnology/Pictures/AIAGENT/app/(admin)/owner/analytics/page.tsx` (lines 261, 341)
5. `/Users/venomxtechnology/Pictures/AIAGENT/app/(admin)/owner/billing/page.tsx` (line 235)
6. `/Users/venomxtechnology/Pictures/AIAGENT/app/(admin)/owner/logs/page.tsx` (line 324)

**Fix Pattern:**
```tsx
// Before (BAD)
{items.map((item, index) => <div key={index}>{item.name}</div>)}

// After (GOOD)
{items.map((item) => <div key={item.id}>{item.name}</div>)}

// If no ID exists, create a stable key
{items.map((item) => <div key={`${item.name}-${item.timestamp}`}>{item.name}</div>)}
```

---

### PRIORITY 3: MEDIUM (MAINTAINABILITY) - Fix This Week
**Estimated Time: 2-3 hours**

#### 3.1 Nested Ternary Operations (S3358)
- **Auto-fixable:** NO (Requires refactoring)
- **Count:** 4 locations
- **Effort:** 30 minutes

**Files:**
1. `/Users/venomxtechnology/Pictures/AIAGENT/app/(admin)/dashboard/page.tsx` (lines 60, 89)
2. `/Users/venomxtechnology/Pictures/AIAGENT/app/(admin)/workflows/page.tsx` (line 210)
3. `/Users/venomxtechnology/Pictures/AIAGENT/components/workspace/WorkspaceSwitcher.tsx` (line 49)

**Fix Pattern:**
```typescript
// Before (BAD)
const status = isActive ? 'active' : isPending ? 'pending' : 'inactive';

// After (GOOD)
const getStatus = () => {
  if (isActive) return 'active';
  if (isPending) return 'pending';
  return 'inactive';
};
const status = getStatus();

// Or use a switch/case for clarity
const getStatus = () => {
  switch (true) {
    case isActive: return 'active';
    case isPending: return 'pending';
    default: return 'inactive';
  }
};
```

#### 3.2 Function Cognitive Complexity (S3776, S3516, S2004)
- **Auto-fixable:** NO (Requires refactoring)
- **Count:** 4 functions
- **Effort:** 2-4 hours

**Complex Functions:**

1. **`/Users/venomxtechnology/Pictures/AIAGENT/app/api/webhooks/instagram/route.ts`**
   - Function: `POST` (complexity: 25, limit: 15)
   - **Action:** Break into smaller functions:
     - `handleVerification()`
     - `handleMessageEvent()`
     - `processIncomingMessage()`
     - `triggerWorkflows()`

2. **`/Users/venomxtechnology/Pictures/AIAGENT/app/api/webhooks/whatsapp/route.ts`**
   - Function: `POST` (complexity: 17, limit: 15)
   - **Action:** Similar extraction pattern

3. **`/Users/venomxtechnology/Pictures/AIAGENT/lib/workflows/execution-engine.ts`**
   - Function: `executeNode` (complexity: 19, limit: 15)
   - **Action:** Extract node type handlers:
     - `executeDelayNode()`
     - `executeConditionNode()`
     - `executeAINode()`
     - `executeSendMessageNode()`

4. **`/Users/venomxtechnology/Pictures/AIAGENT/types/visual-workflow.ts`**
   - Function at line 591 (complexity: 17, limit: 15)
   - **Action:** Review and refactor

**Refactoring Pattern:**
```typescript
// Before: High complexity function
async function POST(request: Request) {
  // Verification logic
  if (request.method === 'GET') {
    // ...
  }

  // Message handling
  const body = await request.json();
  for (const entry of body.entry) {
    for (const change of entry.changes) {
      if (change.field === 'messages') {
        // Complex nested logic
      }
    }
  }
}

// After: Extracted functions
async function POST(request: Request) {
  if (isVerificationRequest(request)) {
    return handleVerification(request);
  }

  const body = await request.json();
  return processWebhookEvents(body);
}

function isVerificationRequest(request: Request): boolean {
  return request.method === 'GET';
}

async function handleVerification(request: Request) {
  // Verification logic
}

async function processWebhookEvents(body: any) {
  for (const entry of body.entry) {
    await processEntry(entry);
  }
}

async function processEntry(entry: any) {
  // Entry processing logic
}
```

#### 3.3 Empty Catch Blocks (S2486)
- **Auto-fixable:** PARTIAL
- **Count:** 2 files
- **Effort:** 5 minutes

**Files:**
1. `/Users/venomxtechnology/Pictures/AIAGENT/app/(admin)/owner/logs/page.tsx` (line 54)
2. `/Users/venomxtechnology/Pictures/AIAGENT/app/(admin)/owner/workspaces/page.tsx` (line 106)

**Fix:**
```typescript
// Before
try {
  await deleteWorkspace(id);
} catch (error) {
  // Empty
}

// After
try {
  await deleteWorkspace(id);
} catch (error) {
  console.error('Failed to delete workspace:', error);
  toast({
    title: "Error",
    description: "Failed to delete workspace. Please try again.",
    variant: "destructive",
  });
}
```

#### 3.4 Props Should Be Readonly (S4323)
- **Auto-fixable:** YES (can be scripted)
- **Count:** 4 components
- **Effort:** 5 minutes

**Files:**
1. `/Users/venomxtechnology/Pictures/AIAGENT/components/admin/stats-card.tsx` (line 15)
2. `/Users/venomxtechnology/Pictures/AIAGENT/components/auth/ProtectedRoute.tsx` (line 7)
3. `/Users/venomxtechnology/Pictures/AIAGENT/components/auth/RoleGuard.tsx` (line 15)
4. `/Users/venomxtechnology/Pictures/AIAGENT/components/stripe/CheckoutButton.tsx` (line 27)

**Fix Pattern:**
```typescript
// Before
function Component({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

// After
function Component({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div>{children}</div>;
}

// Or with explicit interface
interface ComponentProps {
  children: React.ReactNode;
}

function Component({ children }: Readonly<ComponentProps>) {
  return <div>{children}</div>;
}
```

---

### PRIORITY 4: LOW (STYLE & CONFIGURATION) - When Time Permits
**Estimated Time: 45 minutes**

#### 4.1 Console Statements (no-console)
- **Auto-fixable:** PARTIAL
- **Count:** 32 console.log statements
- **Effort:** 15 minutes

**Files:**
1. `/Users/venomxtechnology/Pictures/AIAGENT/app/api/webhooks/instagram/route.ts` (12 instances)
2. `/Users/venomxtechnology/Pictures/AIAGENT/app/api/webhooks/whatsapp/route.ts` (8 instances)
3. `/Users/venomxtechnology/Pictures/AIAGENT/app/api/webhooks/stripe/route.ts` (6 instances)
4. `/Users/venomxtechnology/Pictures/AIAGENT/app/(admin)/workflows/new/page.tsx` (line 118)
5. `/Users/venomxtechnology/Pictures/AIAGENT/app/(public)/forgot-password/page.tsx` (line 18)
6. `/Users/venomxtechnology/Pictures/AIAGENT/app/(public)/reset-password/page.tsx` (line 28)
7. `/Users/venomxtechnology/Pictures/AIAGENT/lib/firebase/platform.ts` (line 326)

**Allowed:** `console.error`, `console.warn`
**Not Allowed:** `console.log`, `console.info`, `console.debug`

**Fix Options:**

1. **Option A: Replace with proper logger**
```typescript
// Create logger utility
// /lib/utils/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(message, data);
    }
  },
  error: (message: string, error?: any) => {
    console.error(message, error);
  },
  warn: (message: string, data?: any) => {
    console.warn(message, data);
  }
};

// Usage
logger.info('Processing webhook', { eventType });
```

2. **Option B: Convert to console.error where appropriate**
```typescript
// Before
console.log('Error processing message:', error);

// After
console.error('Failed to process message:', error);
```

3. **Option C: Remove debug logs**
```typescript
// Before
console.log('Received data:', data);

// After - remove or comment out
// Only keep in development
if (process.env.NODE_ENV === 'development') {
  console.info('Received data:', data);
}
```

#### 4.2 Commented Out Code (S125)
- **Auto-fixable:** NO (Manual review required)
- **Count:** ~50+ instances
- **Effort:** 20 minutes

**Files with Most Comments:**
- All files in app/ directory (mock data comments, old code)

**Action:** Review and either:
1. Delete if truly unnecessary
2. Implement if needed
3. Convert to proper documentation

**Example Locations:**
```typescript
// app/(admin)/conversations/[id]/page.tsx (lines 129-135)
// Real-time listener (TODO: implement with Firestore)
// const unsubscribe = onSnapshot(
//   doc(db, "conversations", conversationId),
//   (doc) => {
//     setConversation(doc.data());
//   }
// );
// return () => unsubscribe();

// Decision: Keep as reference OR implement OR remove
```

#### 4.3 Prefer Number.parseInt (S2309)
- **Auto-fixable:** YES
- **Count:** 2 locations
- **Effort:** 2 minutes

**Files:**
1. `/Users/venomxtechnology/Pictures/AIAGENT/app/(admin)/workflows/builder/page.tsx` (line 178)
2. `/Users/venomxtechnology/Pictures/AIAGENT/app/(public)/pricing/page.tsx` (line 154)

**Fix:**
```typescript
// Before
const value = parseInt(string, 10);

// After
const value = Number.parseInt(string, 10);
```

#### 4.4 Prefer globalThis over window (S2201)
- **Auto-fixable:** YES
- **Count:** 1 location
- **Effort:** 1 minute

**File:** `/Users/venomxtechnology/Pictures/AIAGENT/components/stripe/CheckoutButton.tsx` (line 75)

**Fix:**
```typescript
// Before
window.location.href = url;

// After
globalThis.location.href = url;
```

#### 4.5 Tailwind Config Duplicates
- **Auto-fixable:** YES
- **Count:** 2 duplicate animation definitions
- **Effort:** 2 minutes

**File:** `/Users/venomxtechnology/Pictures/AIAGENT/tailwind.config.js`

**Issue:** Lines 68-89 define keyframes and animations that might be duplicated

**Action:** Review and remove duplicates (config looks clean in current version)

---

## Automated Fix Scripts

### Script 1: Auto-fix Unused Imports and Variables
```bash
#!/bin/bash
# fix-unused-imports.sh

echo "Fixing unused imports and variables..."

# Auto-fix with ESLint
npx eslint . --ext .ts,.tsx --fix

# Run lint to see remaining issues
npm run lint

echo "Done! Review changes with: git diff"
```

### Script 2: Prefix Unused Variables
```bash
#!/bin/bash
# prefix-unused-vars.sh

echo "Adding underscore prefix to unused variables..."

# Use sed to prefix unused catch variables
find . -name "*.tsx" -o -name "*.ts" | while read file; do
  # Skip node_modules
  if [[ $file == *"node_modules"* ]]; then
    continue
  fi

  # Replace catch (error) with catch (_error) for unused
  sed -i '' 's/} catch (error) {$/} catch (_error) {/g' "$file"
done

echo "Done! Review changes with: git diff"
```

### Script 3: Convert console.log to console.error
```bash
#!/bin/bash
# fix-console-logs.sh

echo "Converting console.log to console.error in error contexts..."

files=(
  "app/api/webhooks/instagram/route.ts"
  "app/api/webhooks/whatsapp/route.ts"
  "app/api/webhooks/stripe/route.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    # Replace console.log with console.error when in error context
    sed -i '' 's/console\.log(\s*["\x27].*error/console.error("/gi' "$file"
    sed -i '' 's/console\.log(\s*["\x27].*failed/console.error("/gi' "$file"
  fi
done

echo "Done! Review changes with: git diff"
```

---

## Recommended Fix Sequence

### Phase 1: Critical Fixes (5-10 minutes)
**DO FIRST - BLOCKS FUNCTIONALITY**

1. Fix Firebase index (1 minute)
   ```bash
   firebase deploy --only firestore:indexes
   ```

2. Fix TypeScript error in footer.tsx (3 minutes)
   - Edit social links type definition
   - Run: `npx tsc --noEmit` to verify

3. Verify build succeeds (2 minutes)
   ```bash
   npm run build
   ```

### Phase 2: Quick Wins (30-45 minutes)
**AUTO-FIXABLE ISSUES**

1. Auto-fix unused imports (5 minutes)
   ```bash
   npx eslint . --ext .ts,.tsx --fix
   npm run lint
   ```

2. Prefix unused variables (10 minutes)
   - Manual review and prefix with underscore
   - Or remove if truly unused

3. Fix console statements (15 minutes)
   - Replace console.log with console.error in error handlers
   - Remove debug console.logs
   - Keep console.error and console.warn

4. Fix simple patterns (5 minutes)
   - Number.parseInt
   - globalThis
   - Readonly props

5. Verify (5 minutes)
   ```bash
   npm run lint
   npm run build
   ```

### Phase 3: Code Quality (1-2 hours)
**MANUAL FIXES**

1. Fix React keys (20 minutes)
   - Replace index-based keys with stable IDs

2. Fix nested ternaries (30 minutes)
   - Extract to helper functions

3. Add error handling to catch blocks (10 minutes)
   - Add console.error or toast notifications

4. Review and remove commented code (20 minutes)
   - Delete or implement

### Phase 4: TODO Implementation (2-4 hours)
**FEATURE COMPLETION**

Priority order:
1. Conversations real-time updates (1 hour)
2. Stripe webhook database updates (45 minutes)
3. WhatsApp webhook improvements (30 minutes)
4. Other TODOs or convert to GitHub issues (1+ hours)

### Phase 5: Refactoring (2-4 hours)
**LONG-TERM MAINTAINABILITY**

1. Reduce function complexity (2-3 hours)
   - Extract webhook handlers
   - Extract workflow execution logic
   - Add unit tests for extracted functions

2. Verify all changes (30 minutes)
   ```bash
   npx tsc --noEmit
   npm run lint
   npm run build
   npm test
   ```

---

## Verification Commands

### TypeScript Check
```bash
npx tsc --noEmit
```

### Linting
```bash
npm run lint
```

### Build Test
```bash
npm run build
```

### Full Verification
```bash
# Run all checks
npx tsc --noEmit && npm run lint && npm run build

# If all pass
echo "All checks passed! ✅"
```

---

## Summary Table

| Priority | Category | Count | Auto-Fix | Manual | Total Time |
|----------|----------|-------|----------|--------|------------|
| CRITICAL | Firebase Index | 1 | YES | NO | 1 min |
| CRITICAL | TypeScript Error | 1 | NO | YES | 3 min |
| HIGH | Unused Imports | 15+ | YES | Verify | 15 min |
| HIGH | Unused Variables | 12+ | PARTIAL | YES | 20 min |
| HIGH | TODO Comments | 23 | NO | YES | 2-4 hrs |
| HIGH | React Keys | 8 | NO | YES | 20 min |
| MEDIUM | Nested Ternaries | 4 | NO | YES | 30 min |
| MEDIUM | Function Complexity | 4 | NO | YES | 2-4 hrs |
| MEDIUM | Empty Catch | 2 | PARTIAL | YES | 5 min |
| MEDIUM | Readonly Props | 4 | YES | Verify | 5 min |
| LOW | Console Statements | 32 | PARTIAL | YES | 15 min |
| LOW | Commented Code | 50+ | NO | YES | 20 min |
| LOW | parseInt | 2 | YES | Verify | 2 min |
| LOW | globalThis | 1 | YES | Verify | 1 min |
| **TOTAL** | | **~160** | **~60** | **~100** | **6-8 hrs** |

---

## Auto-fixable vs Manual

### Auto-fixable (~60 issues, 30 minutes)
- Unused imports (ESLint --fix)
- Unused variable prefixing (script)
- Number.parseInt replacement
- globalThis replacement
- Readonly props (scripted)
- Some console.log replacements

### Manual Required (~100 issues, 5.5-7.5 hours)
- TODO implementations (2-4 hours)
- Function complexity refactoring (2-4 hours)
- React keys replacement (20 minutes)
- Nested ternary extraction (30 minutes)
- Empty catch blocks (5 minutes)
- Commented code review (20 minutes)
- TypeScript error (3 minutes)

---

## Next Steps

1. **Review this plan** and prioritize based on business needs
2. **Schedule fix sessions:**
   - Phase 1 (Critical): ASAP (10 min)
   - Phase 2 (Quick Wins): Today (45 min)
   - Phase 3 (Code Quality): This week (2 hrs)
   - Phase 4 (TODOs): Next sprint (2-4 hrs)
   - Phase 5 (Refactoring): As needed (2-4 hrs)

3. **Create GitHub issues** for TODOs that won't be fixed immediately
4. **Set up pre-commit hooks** to prevent new issues:
   ```bash
   # .husky/pre-commit
   npm run lint
   npx tsc --noEmit
   ```

5. **Track progress** and update this document

---

## Maintenance Recommendations

### Prevent Future Issues

1. **Enable strict TypeScript**
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "strict": true,
       "noUnusedLocals": true,
       "noUnusedParameters": true
     }
   }
   ```

2. **Configure ESLint more strictly**
   ```json
   // .eslintrc.json
   {
     "rules": {
       "@typescript-eslint/no-unused-vars": "error",
       "no-console": ["warn", { "allow": ["warn", "error"] }],
       "react/jsx-key": "error"
     }
   }
   ```

3. **Add pre-commit hooks**
   ```bash
   npx husky-init
   npx husky add .husky/pre-commit "npm run lint && npx tsc --noEmit"
   ```

4. **Regular code reviews** focusing on:
   - No TODO comments (use GitHub issues)
   - No commented code
   - Proper error handling
   - Function complexity < 15

5. **SonarQube CI/CD integration**
   - Run on every PR
   - Block merges if quality gate fails
   - Track technical debt over time

---

*Generated: 2025-11-15*
*Total Estimated Fix Time: 6-8 hours*
*Auto-fixable: 37% of issues*
