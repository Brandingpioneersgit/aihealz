#!/bin/bash

# AIHEALZ Quick Deploy Script
# Syncs code to server and builds on production (where database is available)

set -euo pipefail

# Override via env: SERVER_IP=1.2.3.4 ./deploy-quick.sh
SERVER_USER="${SERVER_USER:-root}"
SERVER_IP="${SERVER_IP:?Set SERVER_IP=<ip-or-hostname> before running}"
SERVER_PORT="${SERVER_PORT:-22}"
DEPLOY_PATH="${DEPLOY_PATH:-/home/aihealz.com/public_html}"

echo "🚀 AIHEALZ Production Deploy"
echo "============================"

# Step 1: Sync files (excluding .env to preserve server config)
echo ""
echo "📤 Step 1: Syncing files to server..."
rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.env' \
    --exclude '.env.local' \
    --exclude '.env.production' \
    --exclude '.next' \
    --exclude 'prisma/*.db' \
    -e "ssh -p ${SERVER_PORT}" \
    ./ ${SERVER_USER}@${SERVER_IP}:${DEPLOY_PATH}/

# Step 2: Install dependencies, build, and restart on server
echo ""
echo "🔧 Step 2: Building and starting on server..."
ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
cd /home/aihealz.com/public_html

echo "Installing dependencies..."
npm install

echo "Generating Prisma client..."
npx prisma generate

echo "Running database migrations..."
npx prisma migrate deploy 2>/dev/null || npx prisma db push --accept-data-loss

echo "Building application..."
npm run build

echo "Restarting application..."
pm2 restart aihealz || pm2 start npm --name "aihealz" -- start
pm2 save

echo ""
echo "✅ Server setup complete!"
ENDSSH

echo ""
echo "═══════════════════════════════════════════"
echo "✅ DEPLOYMENT COMPLETE!"
echo "═══════════════════════════════════════════"
echo ""
echo "🌐 Site: https://aihealz.com"
echo "🔐 Admin: https://aihealz.com/admin"
echo ""
echo "Useful commands on server:"
echo "  pm2 logs aihealz      - View logs"
echo "  pm2 status            - Check status"
echo "  pm2 restart aihealz   - Restart app"
echo ""
