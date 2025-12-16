# Gridlink Setup Script for Windows
# PowerShell version

Write-Host "🚀 Gridlink Setup Script" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed" -ForegroundColor Red
    Write-Host "Please install Node.js 18+ from https://nodejs.org"
    exit 1
}

Write-Host "✅ Node.js $(node -v) detected" -ForegroundColor Green

# Check npm
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm is not installed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ npm $(npm -v) detected" -ForegroundColor Green
Write-Host ""

# Step 1: Install dependencies
Write-Host "📦 Step 1/5: Installing dependencies..." -ForegroundColor Yellow
npm install
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 2: Setup environment
Write-Host "🔑 Step 2/5: Setting up environment variables..." -ForegroundColor Yellow
if (-not (Test-Path .env.local)) {
    if (Test-Path .env.example) {
        Copy-Item .env.example .env.local
        Write-Host "✅ Created .env.local from .env.example" -ForegroundColor Green
        Write-Host "⚠️  Please edit .env.local with your credentials" -ForegroundColor Yellow
    } else {
        Write-Host "❌ .env.example not found" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⚠️  .env.local already exists, skipping..." -ForegroundColor Yellow
}
Write-Host ""

# Step 3: Generate Prisma client
Write-Host "📄 Step 3/5: Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate
Write-Host "✅ Prisma client generated" -ForegroundColor Green
Write-Host ""

# Step 4: Database setup
Write-Host "🐘 Step 4/5: Database setup..." -ForegroundColor Yellow
$response = Read-Host "Do you want to push the database schema now? (y/n)"
if ($response -eq "y") {
    npx prisma db push
    Write-Host "✅ Database schema pushed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Skipped database push. Run 'npx prisma db push' manually later." -ForegroundColor Yellow
}
Write-Host ""

# Step 5: Build check
Write-Host "🛠️ Step 5/5: Build verification..." -ForegroundColor Yellow
$response = Read-Host "Do you want to test the build now? (y/n)"
if ($response -eq "y") {
    npm run build
    Write-Host "✅ Build successful" -ForegroundColor Green
} else {
    Write-Host "⚠️  Skipped build test" -ForegroundColor Yellow
}
Write-Host ""

# Setup complete
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Edit .env.local with your credentials"
Write-Host "2. Run 'npm run dev' to start development server"
Write-Host "3. Visit http://localhost:3000"
Write-Host ""
Write-Host "For more info, see QUICK_START.md"
