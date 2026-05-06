#!/bin/bash

# AIHEALZ Deployment Script
# Deploys to Hostinger VPS with CyberPanel

set -euo pipefail

# Configuration — override via env vars before invoking
SERVER_USER="${SERVER_USER:-root}"
SERVER_IP="${SERVER_IP:?Set SERVER_IP=<ip-or-hostname> before running}"
SERVER_PORT="${SERVER_PORT:-22}"
DEPLOY_PATH="${DEPLOY_PATH:-/home/aihealz.com/public_html}"
APP_NAME="${APP_NAME:-aihealz}"

echo "🚀 Starting AIHEALZ deployment..."
echo "================================="

# Step 1: Install dependencies and build
echo ""
echo "📦 Step 1: Installing dependencies..."
npm ci --production=false

echo ""
echo "🔨 Step 2: Building application..."
npm run build

# Step 3: Sync files to server
echo ""
echo "📤 Step 3: Syncing files to server..."
rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.env' \
    --exclude '.env.local' \
    --exclude '.env.production' \
    --exclude 'secrets/' \
    --exclude '*.sql.gz' \
    --exclude '*.dump' \
    --exclude 'prisma/dev.db*' \
    --exclude '.next/cache' \
    -e "ssh -p ${SERVER_PORT}" \
    ./ ${SERVER_USER}@${SERVER_IP}:${DEPLOY_PATH}/

# Step 4: Install production dependencies and restart on server
echo ""
echo "🔧 Step 4: Setting up server..."
ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
cd /home/aihealz.com/public_html

# Install production dependencies
echo "Installing production dependencies..."
npm ci --production

# Run database migrations
echo "Running database migrations..."
npx prisma generate
npx prisma migrate deploy

# Restart the application with PM2
echo "Restarting application..."
if pm2 describe aihealz > /dev/null 2>&1; then
    pm2 restart aihealz
else
    pm2 start npm --name "aihealz" -- start
fi

pm2 save

echo "Application restarted successfully!"
ENDSSH

echo ""
echo "✅ Deployment complete!"
echo "================================="
echo "🌐 Site: https://aihealz.com"
