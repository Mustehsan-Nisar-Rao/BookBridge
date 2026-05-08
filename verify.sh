#!/bin/bash

# BookBridge Project Verification Script
# This script verifies all required files and dependencies are in place

echo "=================================================="
echo "  BookBridge Project Verification"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter for checks
PASSED=0
FAILED=0

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $1"
        ((FAILED++))
    fi
}

# Function to check if directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $1/"
        ((FAILED++))
    fi
}

echo "📁 Checking Project Structure..."
check_dir "backend"
check_dir "frontend"
check_dir "database"

echo ""
echo "📦 Checking Backend Files..."
check_file "backend/package.json"
check_file "backend/.env.example"
check_file "backend/src/server.js"
check_file "backend/src/config/database.js"
check_file "backend/src/controllers/authController.js"
check_file "backend/src/controllers/bookController.js"
check_file "backend/src/controllers/reviewController.js"
check_file "backend/src/controllers/transactionController.js"
check_file "backend/src/controllers/adminController.js"

echo ""
echo "📦 Checking Frontend Files..."
check_file "frontend/package.json"
check_file "frontend/.env.example"
check_file "frontend/src/App.js"
check_file "frontend/src/App.css"
check_file "frontend/src/context/AuthContext.js"
check_file "frontend/src/services/api.js"

echo ""
echo "🗄️  Checking Database Files..."
check_file "database/schema.sql"

echo ""
echo "📚 Checking Documentation..."
check_file "README.md"
check_file "QUICKSTART.md"
check_file "ARCHITECTURE.md"

echo ""
echo "=================================================="
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All checks passed!${NC} ✓"
    echo ""
    echo "Next steps:"
    echo "1. cd backend && npm install"
    echo "2. cd ../frontend && npm install"
    echo "3. Set up MySQL database from database/schema.sql"
    echo "4. Create .env files from .env.example files"
    echo "5. Run: npm start (in both directories)"
else
    echo -e "${RED}$FAILED checks failed!${NC}"
fi
echo "=================================================="

exit $FAILED
