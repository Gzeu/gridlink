#!/bin/bash

# Gridlink Setup Script
# Automates the complete setup process

set -e  # Exit on error

echo "🚀 Gridlink Setup Script"
echo "========================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm -v) detected${NC}"
echo ""

# Step 1: Install dependencies
echo "📦 Step 1/5: Installing dependencies..."
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 2: Setup environment
echo "🔑 Step 2/5: Setting up environment variables..."
if [ ! -f .env.local ]; then
    if [ -f .env.example ]; then
        cp .env.example .env.local
        echo -e "${GREEN}✅ Created .env.local from .env.example${NC}"
        echo -e "${YELLOW}⚠️  Please edit .env.local with your credentials${NC}"
    else
        echo -e "${RED}❌ .env.example not found${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  .env.local already exists, skipping...${NC}"
fi
echo ""

# Step 3: Generate Prisma client
echo "📄 Step 3/5: Generating Prisma client..."
npx prisma generate
echo -e "${GREEN}✅ Prisma client generated${NC}"
echo ""

# Step 4: Setup database (optional)
echo "🐘 Step 4/5: Database setup..."
read -p "Do you want to push the database schema now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx prisma db push
    echo -e "${GREEN}✅ Database schema pushed${NC}"
else
    echo -e "${YELLOW}⚠️  Skipped database push. Run 'npx prisma db push' manually later.${NC}"
fi
echo ""

# Step 5: Build check (optional)
echo "🛠️ Step 5/5: Build verification..."
read -p "Do you want to test the build now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run build
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${YELLOW}⚠️  Skipped build test${NC}"
fi
echo ""

# Setup complete
echo "🎉 Setup Complete!"
echo "========================"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your credentials"
echo "2. Run 'npm run dev' to start development server"
echo "3. Visit http://localhost:3000"
echo ""
echo "For more info, see QUICK_START.md"
