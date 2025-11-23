#!/bin/bash

# Manheim Scraper - Local Runner
# This script runs the scraper in a local environment (not sandboxed)

echo "🚀 Manheim Auction Scraper"
echo "=========================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found"
    echo "Creating from .env.example..."
    cp .env.example .env
    echo "Please edit .env file with your credentials before running"
    exit 1
fi

echo "✅ Dependencies installed"
echo "✅ Configuration found"
echo ""
echo "🏃 Starting scraper..."
echo ""

# Run the scraper
node scraper.js

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Scraping completed successfully!"
    echo "📁 Check these files for results:"
    echo "   - vehicles.json (scraped data)"
    echo "   - manheim-results.png (screenshot)"
    echo "   - page.html (page source)"
else
    echo ""
    echo "❌ Scraping failed"
    echo "Check the error messages above for details"
    exit 1
fi
