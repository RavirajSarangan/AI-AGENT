#!/bin/bash
# Fix Style Issues - parseInt, globalThis, etc.
# Automated fixes for simple pattern replacements

set -e

echo "================================"
echo "Style Issues Fix Script"
echo "================================"
echo ""

FIXED=0

# Fix 1: parseInt -> Number.parseInt
echo "1. Fixing parseInt -> Number.parseInt..."
FILES_PARSEINT=(
  "app/(admin)/workflows/builder/page.tsx"
  "app/(public)/pricing/page.tsx"
)

for file in "${FILES_PARSEINT[@]}"; do
  if [ -f "$file" ]; then
    # Only replace standalone parseInt, not Number.parseInt
    sed -i '' 's/\([^.]\)parseInt(/\1Number.parseInt(/g' "$file"
    echo "  ✓ Fixed: $file"
    ((FIXED++))
  fi
done

# Fix 2: window.location -> globalThis.location
echo ""
echo "2. Fixing window.location -> globalThis.location..."
FILE_WINDOW="components/stripe/CheckoutButton.tsx"

if [ -f "$FILE_WINDOW" ]; then
  sed -i '' 's/window\.location/globalThis.location/g' "$FILE_WINDOW"
  echo "  ✓ Fixed: $FILE_WINDOW"
  ((FIXED++))
fi

# Fix 3: Add type keyword for type-only constants
echo ""
echo "3. Fixing type-only constants..."
FILE_TOAST="hooks/use-toast.ts"

if [ -f "$FILE_TOAST" ]; then
  # This is a safer manual fix - just notify
  echo "  ⚠ Manual fix required for: $FILE_TOAST"
  echo "    Change: const actionTypes = ..."
  echo "    To: type ActionTypes = ..."
fi

echo ""
echo "================================"
echo "Summary"
echo "================================"
echo "Auto-fixed: $FIXED items"
echo ""
echo "Review changes with: git diff"
echo "Run verification: npm run lint"
echo ""
echo "Done!"
