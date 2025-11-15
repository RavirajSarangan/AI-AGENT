#!/bin/bash
# Fix Console Logs - Convert to proper logging
# Replaces console.log with console.error in error contexts

set -e

echo "================================"
echo "Console Log Fix Script"
echo "================================"
echo ""

# Files to process
FILES=(
  "app/api/webhooks/instagram/route.ts"
  "app/api/webhooks/whatsapp/route.ts"
  "app/api/webhooks/stripe/route.ts"
  "lib/firebase/platform.ts"
)

FIXED=0
SKIPPED=0

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing: $file"

    # Create backup
    cp "$file" "$file.backup"

    # Replace console.log with console.error in error contexts
    sed -i '' 's/console\.log(\([^)]*\)error/console.error(\1error/gi' "$file"
    sed -i '' 's/console\.log(\([^)]*\)failed/console.error(\1failed/gi' "$file"
    sed -i '' 's/console\.log(\([^)]*\)Error/console.error(\1Error/gi' "$file"
    sed -i '' 's/console\.log(\([^)]*\)Failed/console.error(\1Failed/gi' "$file"

    echo "  ✓ Processed"
    ((FIXED++))
  else
    echo "  ⚠ Not found: $file"
    ((SKIPPED++))
  fi
done

echo ""
echo "================================"
echo "Summary"
echo "================================"
echo "Fixed: $FIXED files"
echo "Skipped: $SKIPPED files"
echo ""
echo "Backup files created with .backup extension"
echo "Review changes with: git diff"
echo ""
echo "To remove backups after review:"
echo "  find . -name '*.backup' -delete"
echo ""
echo "Done!"
