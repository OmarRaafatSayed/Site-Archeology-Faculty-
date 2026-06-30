# Migration Script: NPM to PNPM
# This script automates the migration from NPM to PNPM

Write-Host "🚀 Starting migration from NPM to PNPM..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if PNPM is installed
Write-Host "Step 1: Checking PNPM installation..." -ForegroundColor Yellow
$pnpmVersion = pnpm --version 2>$null

if (-not $pnpmVersion) {
    Write-Host "❌ PNPM is not installed!" -ForegroundColor Red
    Write-Host "Installing PNPM globally..." -ForegroundColor Yellow
    
    try {
        npm install -g pnpm@latest
        Write-Host "✅ PNPM installed successfully!" -ForegroundColor Green
        $pnpmVersion = pnpm --version
    }
    catch {
        Write-Host "❌ Failed to install PNPM. Please install manually:" -ForegroundColor Red
        Write-Host "   Run: npm install -g pnpm" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "✅ PNPM version $pnpmVersion is installed" -ForegroundColor Green
Write-Host ""

# Step 2: Clean old dependencies
Write-Host "Step 2: Cleaning old NPM dependencies..." -ForegroundColor Yellow

$directories = @(
    "node_modules",
    "backend\node_modules",
    "frontend\node_modules"
)

$lockfiles = @(
    "package-lock.json",
    "backend\package-lock.json",
    "frontend\package-lock.json"
)

foreach ($dir in $directories) {
    if (Test-Path $dir) {
        Write-Host "   Removing $dir..." -ForegroundColor Gray
        Remove-Item -Path $dir -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "   ✅ Removed $dir" -ForegroundColor Green
    }
}

foreach ($file in $lockfiles) {
    if (Test-Path $file) {
        Write-Host "   Removing $file..." -ForegroundColor Gray
        Remove-Item -Path $file -Force -ErrorAction SilentlyContinue
        Write-Host "   ✅ Removed $file" -ForegroundColor Green
    }
}

Write-Host "✅ Cleanup complete!" -ForegroundColor Green
Write-Host ""

# Step 3: Clean build artifacts and cache
Write-Host "Step 3: Cleaning build artifacts and cache..." -ForegroundColor Yellow

$buildDirs = @(
    "backend\dist",
    "frontend\.next",
    ".cache"
)

foreach ($dir in $buildDirs) {
    if (Test-Path $dir) {
        Write-Host "   Removing $dir..." -ForegroundColor Gray
        Remove-Item -Path $dir -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "   ✅ Removed $dir" -ForegroundColor Green
    }
}

Write-Host "✅ Build artifacts cleaned!" -ForegroundColor Green
Write-Host ""

# Step 4: Install dependencies with PNPM
Write-Host "Step 4: Installing dependencies with PNPM..." -ForegroundColor Yellow
Write-Host "   This may take a few minutes..." -ForegroundColor Gray
Write-Host ""

try {
    pnpm install
    Write-Host ""
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
    Write-Host "   Please run 'pnpm install' manually" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 5: Verify installation
Write-Host "Step 5: Verifying installation..." -ForegroundColor Yellow

$checks = @(
    @{Path="node_modules"; Expected=$true},
    @{Path="backend\node_modules"; Expected=$true},
    @{Path="frontend\node_modules"; Expected=$true},
    @{Path="pnpm-lock.yaml"; Expected=$true},
    @{Path="package-lock.json"; Expected=$false}
)

$allGood = $true
foreach ($check in $checks) {
    $exists = Test-Path $check.Path
    $status = if ($exists -eq $check.Expected) { "✅" } else { "❌"; $allGood = $false }
    $expectation = if ($check.Expected) { "should exist" } else { "should not exist" }
    Write-Host "   $status $($check.Path) ($expectation)" -ForegroundColor $(if ($exists -eq $check.Expected) { "Green" } else { "Red" })
}

Write-Host ""

if ($allGood) {
    Write-Host "🎉 Migration completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Summary:" -ForegroundColor Cyan
    Write-Host "   • Removed old npm dependencies and lock files" -ForegroundColor White
    Write-Host "   • Cleaned build artifacts and cache" -ForegroundColor White
    Write-Host "   • Installed dependencies with PNPM" -ForegroundColor White
    Write-Host "   • Created pnpm-lock.yaml" -ForegroundColor White
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Test the application: pnpm run dev" -ForegroundColor White
    Write-Host "   2. Analyze bundle size: pnpm run analyze" -ForegroundColor White
    Write-Host "   3. Commit changes to git" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Useful Commands:" -ForegroundColor Cyan
    Write-Host "   pnpm run dev          - Start development servers" -ForegroundColor White
    Write-Host "   pnpm run build        - Build all packages" -ForegroundColor White
    Write-Host "   pnpm run analyze      - Analyze bundle size" -ForegroundColor White
    Write-Host "   pnpm run clean:cache  - Clean all cache files" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "⚠️  Migration completed with warnings" -ForegroundColor Yellow
    Write-Host "   Please review the checks above" -ForegroundColor Yellow
}
