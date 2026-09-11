#!/usr/bin/env bash
# ==============================================================================
# OmniHealth EHR - Live Cloud Deployment Script
# Supports 1-command deployment to Vercel, Netlify, GitHub Pages, or Firebase
# ==============================================================================

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=================================================="
echo " OmniHealth EHR - Production Deployment Assistant"
echo " Directory: $DIR"
echo "=================================================="

echo ""
echo "Select deployment destination:"
echo "1) Vercel (Instant live deployment)"
echo "2) Netlify (Instant live deployment)"
echo "3) GitHub Pages"
echo "4) Local Live Server (Python Daemon)"
echo "5) Exit"
echo ""

read -p "Enter choice [1-5]: " choice

case $choice in
  1)
    echo "Deploying to Vercel..."
    if command -v npx &> /dev/null; then
      npx -y vercel --prod
    else
      echo "Error: npx not found. Please install Node.js or run 'npm install -g vercel'."
    fi
    ;;
  2)
    echo "Deploying to Netlify..."
    if command -v npx &> /dev/null; then
      npx -y netlify-cli deploy --prod --dir=.
    else
      echo "Error: npx not found. Please install Node.js or run 'npm install -g netlify-cli'."
    fi
    ;;
  3)
    echo "Publishing to GitHub Pages..."
    git init
    git add .
    git commit -m "Deploy OmniHealth EHR to GitHub Pages"
    echo "Now set your remote repository and push to gh-pages branch:"
    echo "git remote add origin <your-repo-url>"
    echo "git push -u origin main:gh-pages"
    ;;
  4)
    echo "Starting local live server on port 8080..."
    python3 server.py
    ;;
  *)
    echo "Exiting."
    exit 0
    ;;
esac
