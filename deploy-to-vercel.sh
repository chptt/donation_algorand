#!/bin/bash

# Donatechain Vercel Deployment Script
# This script helps you deploy your project to Vercel

echo "🚀 Donatechain Vercel Deployment Helper"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    echo "Please run this script from the Donatechain directory"
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local not found!"
    echo "Creating from .env.example..."
    cp .env.example .env.local
    echo "✅ Created .env.local - please edit it with your values"
    echo ""
fi

# Read App ID from .env.local
if [ -f ".env.local" ]; then
    APP_ID=$(grep NEXT_PUBLIC_ALGORAND_APP_ID .env.local | cut -d '=' -f2)
    ALGOD_SERVER=$(grep NEXT_PUBLIC_ALGOD_SERVER .env.local | cut -d '=' -f2)
    
    echo "📋 Current Configuration:"
    echo "   App ID: $APP_ID"
    echo "   Server: $ALGOD_SERVER"
    echo ""
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - Donatechain"
    echo "✅ Git initialized"
    echo ""
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI not found!"
    echo ""
    echo "Would you like to install it? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "Installing Vercel CLI..."
        npm install -g vercel
        echo "✅ Vercel CLI installed"
    else
        echo ""
        echo "Please install Vercel CLI manually:"
        echo "  npm install -g vercel"
        echo ""
        echo "Or deploy via Vercel Dashboard:"
        echo "  https://vercel.com/new"
        exit 0
    fi
fi

echo ""
echo "🎯 Deployment Options:"
echo "1. Deploy via Vercel CLI (recommended for first-time)"
echo "2. Deploy to production"
echo "3. Open Vercel Dashboard"
echo "4. Exit"
echo ""
echo "Choose an option (1-4):"
read -r option

case $option in
    1)
        echo ""
        echo "🚀 Starting Vercel deployment..."
        echo ""
        echo "⚠️  IMPORTANT: When prompted, add these environment variables:"
        echo "   NEXT_PUBLIC_ALGORAND_APP_ID=$APP_ID"
        echo "   NEXT_PUBLIC_ALGOD_SERVER=$ALGOD_SERVER"
        echo "   NEXT_PUBLIC_ALGOD_TOKEN="
        echo "   NEXT_PUBLIC_ALGOD_PORT="
        echo ""
        echo "Press Enter to continue..."
        read -r
        vercel
        ;;
    2)
        echo ""
        echo "🚀 Deploying to production..."
        vercel --prod
        ;;
    3)
        echo ""
        echo "🌐 Opening Vercel Dashboard..."
        if command -v xdg-open &> /dev/null; then
            xdg-open "https://vercel.com/new"
        elif command -v open &> /dev/null; then
            open "https://vercel.com/new"
        else
            echo "Please visit: https://vercel.com/new"
        fi
        ;;
    4)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment process completed!"
echo ""
echo "📚 Next Steps:"
echo "1. Visit your Vercel dashboard to see deployment status"
echo "2. Add/verify environment variables in Vercel settings"
echo "3. Test your deployed site"
echo "4. Share the URL with users!"
echo ""
echo "📖 For detailed instructions, see:"
echo "   - QUICKSTART.md (fast deployment)"
echo "   - DEPLOYMENT.md (detailed guide)"
echo "   - USER_GUIDE.md (for your users)"
echo ""
echo "🎉 Happy deploying!"
