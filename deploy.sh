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

# Generate Prisma client. Schema migrations are NOT auto-applied:
# db/migrations/*.sql are raw bootstrap migrations and there is no
# prisma/migrations/ baseline yet, so `prisma migrate deploy` is a no-op
# at best and a footgun at worst. Apply new SQL changes manually:
#   psql "$DATABASE_URL" -f db/migrations/0NN_xxx.sql
# and add IF NOT EXISTS guards before doing so. See docs/PRODUCTION_ROADMAP.md
# (TODO: baseline a Prisma migration so this is automatic).
echo "Generating Prisma client..."
npx prisma generate

# Restart the application with PM2 (cluster mode via ecosystem config).
echo "Restarting application..."
if pm2 describe aihealz > /dev/null 2>&1; then
    pm2 reload ecosystem.aihealz.config.js --update-env
else
    pm2 start ecosystem.aihealz.config.js
fi

pm2 save

echo "Application restarted successfully!"
ENDSSH

echo ""
echo "✅ Deployment complete!"
echo "================================="
echo "🌐 Site: https://aihealz.com"
