# SonarQube Quick Fix Checklist

## Quick Start - Run These Commands First

```bash
# 1. Fix Firebase index (CRITICAL)
firebase deploy --only firestore:indexes

# 2. Auto-fix what we can
npx eslint . --ext .ts,.tsx --fix

# 3. Check remaining issues
npm run lint

# 4. Verify TypeScript
npx tsc --noEmit

# 5. Test build
npm run build
```

---

## Phase 1: Critical (5 minutes) ✅

### [ ] Firebase Index
```bash
firebase deploy --only firestore:indexes
# OR click: https://console.firebase.google.com/...
```

### [ ] TypeScript Error - footer.tsx
**File:** `/Users/venomxtechnology/Pictures/AIAGENT/components/public/footer.tsx`

Change line 32-36 from:
```typescript
const socialLinks = [
  { icon: "twitter", href: "...", label: "Twitter" },
  // ...
];
```

To:
```typescript
interface SocialLink {
  icon: string;
  href: string;
  label: string;
}

const socialLinks: SocialLink[] = [
  { icon: "twitter", href: "https://twitter.com/flowreplyai", label: "Twitter" },
  { icon: "linkedin", href: "https://linkedin.com/company/flowreplyai", label: "LinkedIn" },
  { icon: "github", href: "https://github.com/flowreplyai", label: "GitHub" },
  { icon: "mail", href: "mailto:support@flowreplyai.com", label: "Email" },
];
```

Remove lines 69-78 (the broken JSX) and replace with:
```tsx
<span className="h-5 w-5 inline-flex items-center justify-center text-lg" aria-hidden="true">
  {social.icon === 'twitter' && '𝕏'}
  {social.icon === 'linkedin' && 'in'}
  {social.icon === 'github' && '✦'}
  {social.icon === 'mail' && '✉'}
</span>
```

**Verify:**
```bash
npx tsc --noEmit
```

---

## Phase 2: Auto-fixable (30 minutes) ⚡

### [ ] Unused Imports & Variables
```bash
# Auto-fix
npx eslint . --ext .ts,.tsx --fix

# Check results
npm run lint
```

### [ ] Manual: Prefix Unused Variables

**File:** `app/(admin)/owner-dashboard/page.tsx`
Line 27: `const [loading, setLoading]` → `const [_loading, _setLoading]`

**File:** `app/(admin)/owner/analytics/page.tsx`
Line 44: `const [loading, setLoading]` → `const [_loading, _setLoading]`

**File:** `app/(admin)/owner/logs/page.tsx`
Line 54:
```typescript
} catch (error) {
```
→
```typescript
} catch (error) {
  console.error('Failed to load logs:', error);
}
```

**File:** `app/(admin)/settings/billing/page.tsx`
- Line 25: `const TENANT_ID` → `const _TENANT_ID`
- Line 145: `(newPlan)` → `(_newPlan)`

**File:** `app/(admin)/settings/instagram/page.tsx`
Line 5: `const TENANT_ID` → `const _TENANT_ID`

**File:** `app/(admin)/settings/whatsapp/page.tsx`
Choose one:
- Option A: Implement the functionality
- Option B: Remove unused state
Lines to review: 14, 19, 21, 41, 58, 70

**File:** `app/(admin)/workflows/builder/page.tsx`
Line 126: Remove `setRightPanelExpanded` or use it

**File:** `app/page.tsx`
Line 136: Remove `fadeIn` variable

**File:** `hooks/use-toast.ts`
Line 21: `const actionTypes` → `type ActionTypes`

### [ ] Console Statements

**Quick Fix - Webhooks:** Convert error logs
```bash
# In these files, change console.log to console.error for error cases:
# - app/api/webhooks/instagram/route.ts
# - app/api/webhooks/whatsapp/route.ts
# - app/api/webhooks/stripe/route.ts
```

**Pattern:**
```typescript
// Before
console.log('Error:', error);

// After
console.error('Operation failed:', error);
```

**Remove debug logs:**
- `app/(admin)/workflows/new/page.tsx` line 118
- `app/(public)/forgot-password/page.tsx` line 18
- `app/(public)/reset-password/page.tsx` line 28
- `lib/firebase/platform.ts` line 326

### [ ] Quick Style Fixes

**Number.parseInt:**
- `app/(admin)/workflows/builder/page.tsx` line 178
- `app/(public)/pricing/page.tsx` line 154
```typescript
parseInt(value, 10) → Number.parseInt(value, 10)
```

**globalThis:**
- `components/stripe/CheckoutButton.tsx` line 75
```typescript
window.location.href → globalThis.location.href
```

---

## Phase 3: React Keys (20 minutes) 🔑

### Pattern
```tsx
// ❌ BAD
{items.map((item, index) => <div key={index}>...

// ✅ GOOD
{items.map((item) => <div key={item.id}>...
```

### [ ] Files to Fix

1. **app/(admin)/agent-dashboard/page.tsx** - Line 148
2. **app/(admin)/analytics/page.tsx** - Lines 245, 253, 308
3. **app/(admin)/dashboard/page.tsx** - Line 216
4. **app/(admin)/owner/analytics/page.tsx** - Lines 261, 341
5. **app/(admin)/owner/billing/page.tsx** - Line 235
6. **app/(admin)/owner/logs/page.tsx** - Line 324

---

## Phase 4: Nested Ternaries (30 minutes) 🌳

### [ ] dashboard/page.tsx - Lines 60 & 89
```typescript
// Before
const value = cond1 ? val1 : cond2 ? val2 : val3;

// After
const getValue = () => {
  if (cond1) return val1;
  if (cond2) return val2;
  return val3;
};
const value = getValue();
```

### [ ] workflows/page.tsx - Line 210
Extract to helper function

### [ ] WorkspaceSwitcher.tsx - Line 49
Extract to helper function

---

## Phase 5: Readonly Props (5 minutes) 📖

### [ ] Components to Fix

1. **components/admin/stats-card.tsx** - Line 15
2. **components/auth/ProtectedRoute.tsx** - Line 7
3. **components/auth/RoleGuard.tsx** - Line 15
4. **components/stripe/CheckoutButton.tsx** - Line 27

**Pattern:**
```typescript
// Before
function Component({ children }: { children: React.ReactNode }) {

// After
function Component({ children }: Readonly<{ children: React.ReactNode }>) {
```

---

## Phase 6: Empty Catch Blocks (5 minutes) 🛡️

### [ ] owner/logs/page.tsx - Line 54
```typescript
} catch (error) {
  console.error('Failed to load logs:', error);
}
```

### [ ] owner/workspaces/page.tsx - Line 106
```typescript
} catch (error) {
  console.error('Failed to delete workspace:', error);
  toast({
    title: "Error",
    description: "Failed to delete workspace",
    variant: "destructive",
  });
}
```

---

## Phase 7: TODOs - Quick Wins (1 hour) 📝

### [ ] High Priority - Implement

**conversations/[id]/page.tsx** - Real-time updates
- Lines 127-135: Implement Firestore listener
- Lines 156, 164, 172, 182, 190, 198: Implement backend calls

**webhooks/stripe/route.ts** - Database updates
- Lines 42, 53, 61, 69, 77: Add Firestore updates

### [ ] Convert to GitHub Issues

Create issues for:
1. Email invitations (users.ts:227)
2. Tenant auth context (workflows/page.tsx:44)
3. Analytics real data (owner/analytics/page.tsx:56)
4. Instagram profile fetch (webhooks/instagram/route.ts:131)
5. WhatsApp tenant lookup (webhooks/whatsapp/route.ts:118)

Then remove the TODO comments.

---

## Phase 8: Commented Code (20 minutes) 🗑️

### [ ] Review and Remove

**Pattern:** Search for `//` followed by code
```bash
# Find commented code
grep -r "^\s*//\s*const\|^\s*//\s*function\|^\s*//\s*return" app/ --include="*.tsx"
```

**Decision for each:**
- Delete if obsolete
- Implement if needed
- Convert to proper documentation

**High-priority files:**
- `app/(admin)/conversations/[id]/page.tsx` (lines 129-135)
- `app/(admin)/workflows/list-page.tsx` (line 25)
- `app/(admin)/analytics/page.tsx` (line 36)

---

## Final Verification ✅

```bash
# 1. TypeScript compilation
npx tsc --noEmit

# 2. Linting
npm run lint

# 3. Build
npm run build

# 4. Tests (if applicable)
npm test

# All should pass with 0 errors
```

---

## Progress Tracking

**Total Issues:** 107
- [x] Firebase Index (1)
- [ ] TypeScript Error (1)
- [ ] Unused Imports (15)
- [ ] Unused Variables (12)
- [ ] Console Statements (32)
- [ ] React Keys (8)
- [ ] Nested Ternaries (4)
- [ ] Readonly Props (4)
- [ ] Empty Catch (2)
- [ ] TODOs (23)
- [ ] Commented Code (50+)
- [ ] parseInt (2)
- [ ] globalThis (1)

**Completed:** _____ / 107

---

## Time Estimates

| Phase | Tasks | Time | Status |
|-------|-------|------|--------|
| 1. Critical | 2 | 5 min | ⏳ |
| 2. Auto-fix | 30 | 30 min | ⏳ |
| 3. React Keys | 8 | 20 min | ⏳ |
| 4. Ternaries | 4 | 30 min | ⏳ |
| 5. Readonly | 4 | 5 min | ⏳ |
| 6. Catch Blocks | 2 | 5 min | ⏳ |
| 7. TODOs | 10+ | 1 hr | ⏳ |
| 8. Comments | 20+ | 20 min | ⏳ |
| **Total** | **80+** | **2h 55min** | **0%** |

*Note: Complex refactoring (function complexity, full TODO implementation) not included - add 2-4 hours*

---

## Quick Commands Reference

```bash
# Lint check
npm run lint

# Lint fix
npx eslint . --ext .ts,.tsx --fix

# TypeScript check
npx tsc --noEmit

# Build
npm run build

# Find TODOs
grep -r "TODO" app/ lib/ --include="*.ts" --include="*.tsx"

# Find console.log
grep -r "console\.log" app/ lib/ --include="*.ts" --include="*.tsx"

# Find commented code
grep -r "^\s*//\s*\(const\|function\|return\)" app/ --include="*.tsx"
```

---

*Last Updated: 2025-11-15*
*Start with Phase 1 and work sequentially*
