#!/bin/bash
# Automated Fix Script - Unused Imports and Basic Issues
# This script auto-fixes issues that can be safely automated

set -e  # Exit on error

echo "================================"
echo "SonarQube Auto-Fix Script"
echo "================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track progress
FIXED=0
FAILED=0

echo "Phase 1: Running ESLint auto-fix..."
echo "-----------------------------------"
if npx eslint . --ext .ts,.tsx --fix; then
    echo -e "${GREEN}✓ ESLint auto-fix completed${NC}"
    ((FIXED++))
else
    echo -e "${RED}✗ ESLint auto-fix had issues${NC}"
    ((FAILED++))
fi
echo ""

echo "Phase 2: Checking TypeScript compilation..."
echo "-------------------------------------------"
if npx tsc --noEmit; then
    echo -e "${GREEN}✓ TypeScript compilation successful${NC}"
    ((FIXED++))
else
    echo -e "${YELLOW}⚠ TypeScript errors found - manual fix required${NC}"
    echo "See: SONARQUBE_QUICK_FIX.md for instructions"
fi
echo ""

echo "Phase 3: Checking for remaining lint issues..."
echo "----------------------------------------------"
LINT_OUTPUT=$(npm run lint 2>&1 || true)
WARNING_COUNT=$(echo "$LINT_OUTPUT" | grep -c "warning" || echo "0")

if [ "$WARNING_COUNT" -eq "0" ]; then
    echo -e "${GREEN}✓ No lint warnings remaining!${NC}"
    ((FIXED++))
else
    echo -e "${YELLOW}⚠ $WARNING_COUNT lint warnings remaining${NC}"
    echo "Run 'npm run lint' for details"
fi
echo ""

echo "================================"
echo "Summary"
echo "================================"
echo -e "Auto-fixed: ${GREEN}$FIXED${NC} phases"
echo -e "Manual required: ${YELLOW}$FAILED${NC} phases"
echo ""
echo "Next steps:"
echo "1. Review changes: git diff"
echo "2. Check remaining issues: npm run lint"
echo "3. Follow manual fixes in SONARQUBE_QUICK_FIX.md"
echo ""
echo "Done!"
