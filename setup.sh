#!/bin/bash
# Freerock Solar PWA — Setup Script
set -e

echo "=== Freerock Solar PWA Setup ==="
echo ""

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "Node.js is required. Install from https://nodejs.org"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm is required."; exit 1; }

echo "Node.js $(node --version)"
echo "npm $(npm --version)"
echo ""

# Install dependencies
echo "Installing dependencies..."
npm install

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
  echo ""
  echo "Creating .env.local from template..."
  cp .env.example .env.local
  echo "⚠  EDIT .env.local with your actual keys before deploying"
fi

# Build
echo ""
echo "Building..."
npm run build

echo ""
echo "=== Setup complete ==="
echo "Run 'npm run dev' to start development server"
echo "Run 'npm start' for production server"
