#!/bin/bash
# Deploy aihealz from local IDE to VPS

set -euo pipefail

# Override via env: VPS_HOST=1.2.3.4 ./deploy-to-vps.sh
VPS_HOST="${VPS_HOST:?Set VPS_HOST=<ip-or-hostname> before running}"
VPS_USER="${VPS_USER:-root}"
VPS_PATH="${VPS_PATH:-/home/aihealz.com/public_html}"
APP_NAME="${APP_NAME:-aihealz}"

echo "==> Syncing code to VPS ($VPS_USER@$VPS_HOST)..."
rsync -avz --progress \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='*.log' \
  --exclude='.env.local' \
  --exclude='build*.log' \
  --exclude='mass-gen.log' \
  --exclude='.condition-generation-errors.log' \
  --exclude='curl_treatment.html' \
  --exclude='.DS_Store' \
  --exclude='.env' \
  --exclude='.env.production' \
  --exclude='secrets/' \
  --exclude='*.sql.gz' \
  --exclude='*.dump' \
  --exclude='prisma/dev.db*' \
  ./ "$VPS_USER@$VPS_HOST:$VPS_PATH/"

echo "==> Installing dependencies on VPS..."
ssh "$VPS_USER@$VPS_HOST" "cd $VPS_PATH && npm install 2>&1 | tail -10"

echo "==> Building on VPS..."
ssh "$VPS_USER@$VPS_HOST" "cd $VPS_PATH && npm run build 2>&1 | tail -20"

echo "==> Restarting PM2 ($APP_NAME)..."
ssh "$VPS_USER@$VPS_HOST" "pm2 restart $APP_NAME 2>&1 || pm2 start npm --name $APP_NAME -- start"

echo "==> Done!"
ssh "$VPS_USER@$VPS_HOST" "pm2 status $APP_NAME"
