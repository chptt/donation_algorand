@echo off
REM Donatechain Vercel Deployment Script for Windows
REM This script helps you deploy your project to Vercel

echo.
echo 🚀 Donatechain Vercel Deployment Helper
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found!
    echo Please run this script from the Donatechain directory
    pause
    exit /b 1
)

REM Check if .env.local exists
if not exist ".env.local" (
    echo ⚠️  Warning: .env.local not found!
    echo Creating from .env.example...
    copy .env.example .env.local
    echo ✅ Created .env.local - please edit it with your values
    echo.
)

REM Display current configuration
if exist ".env.local" (
    echo 📋 Current Configuration:
    findstr "NEXT_PUBLIC_ALGORAND_APP_ID" .env.local
    findstr "NEXT_PUBLIC_ALGOD_SERVER" .env.local
    echo.
)

REM Check if git is initialized
if not exist ".git" (
    echo 📦 Initializing Git repository...
    git init
    git add .
    git commit -m "Initial commit - Donatechain"
    echo ✅ Git initialized
    echo.
)

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Vercel CLI not found!
    echo.
    echo Would you like to install it? (Y/N)
    set /p response=
    if /i "%response%"=="Y" (
        echo Installing Vercel CLI...
        npm install -g vercel
        echo ✅ Vercel CLI installed
    ) else (
        echo.
        echo Please install Vercel CLI manually:
        echo   npm install -g vercel
        echo.
        echo Or deploy via Vercel Dashboard:
        echo   https://vercel.com/new
        pause
        exit /b 0
    )
)

echo.
echo 🎯 Deployment Options:
echo 1. Deploy via Vercel CLI (recommended for first-time)
echo 2. Deploy to production
echo 3. Open Vercel Dashboard
echo 4. Exit
echo.
set /p option=Choose an option (1-4): 

if "%option%"=="1" (
    echo.
    echo 🚀 Starting Vercel deployment...
    echo.
    echo ⚠️  IMPORTANT: When prompted, add these environment variables:
    echo    NEXT_PUBLIC_ALGORAND_APP_ID=757438126
    echo    NEXT_PUBLIC_ALGOD_SERVER=https://testnet-api.algonode.cloud
    echo    NEXT_PUBLIC_ALGOD_TOKEN=
    echo    NEXT_PUBLIC_ALGOD_PORT=
    echo.
    pause
    vercel
) else if "%option%"=="2" (
    echo.
    echo 🚀 Deploying to production...
    vercel --prod
) else if "%option%"=="3" (
    echo.
    echo 🌐 Opening Vercel Dashboard...
    start https://vercel.com/new
) else if "%option%"=="4" (
    echo 👋 Goodbye!
    exit /b 0
) else (
    echo ❌ Invalid option
    pause
    exit /b 1
)

echo.
echo ✅ Deployment process completed!
echo.
echo 📚 Next Steps:
echo 1. Visit your Vercel dashboard to see deployment status
echo 2. Add/verify environment variables in Vercel settings
echo 3. Test your deployed site
echo 4. Share the URL with users!
echo.
echo 📖 For detailed instructions, see:
echo    - QUICKSTART.md (fast deployment)
echo    - DEPLOYMENT.md (detailed guide)
echo    - USER_GUIDE.md (for your users)
echo.
echo 🎉 Happy deploying!
echo.
pause
