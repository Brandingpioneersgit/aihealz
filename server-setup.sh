#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════
# AIHEALZ Server Setup Script
# Run this on your Hostinger VPS to set up the production environment
#
# SECRETS:
#   This script does NOT contain secrets. Provide them via environment variables
#   or a sourced ./secrets.env file (which must be in .gitignore and chmod 600).
#
#   Required env vars (or keys in ./secrets.env):
#     ADMIN_EMAIL                 — admin login email
#     ADMIN_PASSWORD              — plaintext admin password (only used to derive
#                                   ADMIN_PASSWORD_HASH; never written to disk)
#     ADMIN_API_KEY               — API key for admin endpoints
#     SESSION_SALT                — 32+ byte hex
#     OPENROUTER_API_KEY
#     SARVAM_API_KEY
#     RESEND_API_KEY
#     CLOUDFLARE_API_TOKEN
#     STRIPE_SECRET_KEY
#     STRIPE_WEBHOOK_SECRET
#     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
#     DATAFORSEO_AUTH
#     INDEXNOW_KEY
#     GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON   — full JSON as a single line
#
#   To generate fresh values quickly:
#     ADMIN_PASSWORD=$(openssl rand -base64 24)
#     SESSION_SALT=$(openssl rand -hex 32)
#     ADMIN_API_KEY="sk-aihealz-admin-$(openssl rand -hex 12)"
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

echo "🚀 AIHEALZ Server Setup"
echo "======================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

DEPLOY_PATH="${DEPLOY_PATH:-/home/aihealz.com/public_html}"

# ── Load secrets ────────────────────────────────────────────────────────────────
# Allow operator to drop a ./secrets.env beside this script. NEVER commit it.
if [ -f "./secrets.env" ]; then
    echo -e "${YELLOW}Loading ./secrets.env (mode-600 expected)${NC}"
    # shellcheck disable=SC1091
    set -a; . ./secrets.env; set +a
fi

REQUIRED_VARS=(
    ADMIN_EMAIL ADMIN_PASSWORD ADMIN_API_KEY SESSION_SALT
    OPENROUTER_API_KEY SARVAM_API_KEY RESEND_API_KEY
    CLOUDFLARE_API_TOKEN STRIPE_SECRET_KEY STRIPE_WEBHOOK_SECRET
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY DATAFORSEO_AUTH INDEXNOW_KEY
    GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON
)
missing=()
for v in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!v:-}" ]; then missing+=("$v"); fi
done
if [ ${#missing[@]} -gt 0 ]; then
    echo -e "${RED}✗ Missing required env vars: ${missing[*]}${NC}"
    echo -e "${RED}  Set them in ./secrets.env or export them before running.${NC}"
    exit 1
fi

# Derive the admin password hash here; never write the plaintext to a file.
ADMIN_PASSWORD_HASH=$(printf '%s' "$ADMIN_PASSWORD" | openssl dgst -sha256 -hex | awk '{print $NF}')
unset ADMIN_PASSWORD  # drop plaintext from env

# ── Step 1: Check PostgreSQL ────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}Step 1: Checking PostgreSQL...${NC}"

if command -v psql &> /dev/null; then
    echo -e "${GREEN}✓ PostgreSQL is installed${NC}"
else
    echo -e "${RED}✗ PostgreSQL not found. Installing...${NC}"
    if command -v dnf &> /dev/null; then
        dnf install -y postgresql-server postgresql-contrib
        postgresql-setup --initdb
    else
        apt-get update && apt-get install -y postgresql postgresql-contrib
    fi
    systemctl enable postgresql
    systemctl start postgresql
fi

# ── Step 2: Create Database and User ────────────────────────────────────────────
echo ""
echo -e "${YELLOW}Step 2: Setting up database...${NC}"

# Generate a random password for the database user
DB_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=' | cut -c1-20)

# Create database and user
sudo -u postgres psql << EOF
-- Create user if not exists
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'aihealz_user') THEN
        CREATE USER aihealz_user WITH PASSWORD '${DB_PASSWORD}';
    END IF;
END
\$\$;

-- Create database if not exists
SELECT 'CREATE DATABASE aihealz OWNER aihealz_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'aihealz')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE aihealz TO aihealz_user;
ALTER USER aihealz_user CREATEDB;
EOF

echo -e "${GREEN}✓ Database 'aihealz' created with user 'aihealz_user'${NC}"

# ── Step 3: Install Redis ───────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}Step 3: Checking Redis...${NC}"

if command -v redis-server &> /dev/null; then
    echo -e "${GREEN}✓ Redis is installed${NC}"
else
    echo -e "${RED}✗ Redis not found. Installing...${NC}"
    if command -v dnf &> /dev/null; then
        dnf install -y redis
    else
        apt-get install -y redis-server
    fi
    systemctl enable redis
    systemctl start redis
fi

# ── Step 4: Install Node.js ─────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}Step 4: Checking Node.js...${NC}"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js ${NODE_VERSION} is installed${NC}"
else
    echo -e "${RED}✗ Node.js not found. Installing...${NC}"
    if command -v dnf &> /dev/null; then
        curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
        dnf install -y nodejs
    else
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
    fi
fi

# ── Step 5: Install PM2 ─────────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}Step 5: Checking PM2...${NC}"

if command -v pm2 &> /dev/null; then
    echo -e "${GREEN}✓ PM2 is installed${NC}"
else
    echo -e "${RED}✗ PM2 not found. Installing...${NC}"
    npm install -g pm2
fi

# ── Step 6: Create .env file ────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}Step 6: Creating production .env file...${NC}"

if [ -f "${DEPLOY_PATH}/.env" ]; then
    echo -e "${YELLOW}  Backing up existing .env to .env.backup${NC}"
    cp "${DEPLOY_PATH}/.env" "${DEPLOY_PATH}/.env.backup"
    chmod 600 "${DEPLOY_PATH}/.env.backup"
fi

# Tighten umask before writing the .env so it's never world-readable.
umask 077

cat > "${DEPLOY_PATH}/.env" << ENVFILE
# ═══════════════════════════════════════════════════════════════════════════════
# AIHEALZ PRODUCTION ENVIRONMENT
# Generated on $(date)
# ═══════════════════════════════════════════════════════════════════════════════

# Database
DATABASE_URL="postgresql://aihealz_user:${DB_PASSWORD}@localhost:5432/aihealz?schema=public"
DIRECT_URL="postgresql://aihealz_user:${DB_PASSWORD}@localhost:5432/aihealz?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"
REDIS_CACHE_TTL=3600

# Application
NODE_ENV="production"
NEXT_PUBLIC_SITE_URL="https://aihealz.com"
NEXT_PUBLIC_DEFAULT_LANG="en"

# Admin Authentication
ADMIN_EMAIL="${ADMIN_EMAIL}"
ADMIN_PASSWORD_HASH="${ADMIN_PASSWORD_HASH}"
ADMIN_API_KEY="${ADMIN_API_KEY}"
SESSION_SALT="${SESSION_SALT}"

# AI/LLM APIs
OPENROUTER_API_KEY="${OPENROUTER_API_KEY}"
AI_API_KEY="${OPENROUTER_API_KEY}"
AI_API_BASE="https://openrouter.ai/api/v1"
AI_MODEL="anthropic/claude-sonnet-4"
AI_MAX_TOKENS=4000

# Translation
SARVAM_API_KEY="${SARVAM_API_KEY}"

# Email
RESEND_API_KEY="${RESEND_API_KEY}"
EMAIL_FROM="noreply@aihealz.com"

# Cloudflare
CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN}"
CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-}"

# Stripe
STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY}"
STRIPE_WEBHOOK_SECRET="${STRIPE_WEBHOOK_SECRET}"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}"

# SEO
DATAFORSEO_AUTH="${DATAFORSEO_AUTH}"
INDEXNOW_KEY="${INDEXNOW_KEY}"
SITEMAP_URLS_PER_FILE=45000
REVALIDATE_SECONDS=3600

# Google Services
GOOGLE_DRIVE_SERVICE_ACCOUNT='${GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON}'
ENVFILE

chmod 600 "${DEPLOY_PATH}/.env"
echo -e "${GREEN}✓ .env file created (mode 600)${NC}"

# ── Step 7: Configure PostgreSQL for local connections ─────────────────────────
echo ""
echo -e "${YELLOW}Step 7: Configuring PostgreSQL authentication...${NC}"

# Update pg_hba.conf to allow local password auth
PG_HBA=$(sudo -u postgres psql -t -c "SHOW hba_file;" | xargs)
if [ -f "$PG_HBA" ]; then
    # Backup
    cp "$PG_HBA" "${PG_HBA}.backup"
    # Add md5 auth for local connections
    if ! grep -q "aihealz_user" "$PG_HBA"; then
        echo "local   aihealz   aihealz_user   md5" >> "$PG_HBA"
        echo "host    aihealz   aihealz_user   127.0.0.1/32   md5" >> "$PG_HBA"
        systemctl reload postgresql
        echo -e "${GREEN}✓ PostgreSQL authentication configured${NC}"
    fi
fi

# ── Step 8: Run Database Migrations ─────────────────────────────────────────────
echo ""
echo -e "${YELLOW}Step 8: Running database migrations...${NC}"

cd "${DEPLOY_PATH}"
npm install
npx prisma generate
npx prisma migrate deploy || npx prisma db push

echo -e "${GREEN}✓ Database migrations complete${NC}"

# ── Step 9: Build Application ───────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}Step 9: Building application...${NC}"

cd "${DEPLOY_PATH}"
npm run build

echo -e "${GREEN}✓ Application built${NC}"

# ── Step 10: Restart Application ────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}Step 10: Restarting application...${NC}"

cd "${DEPLOY_PATH}"

# Stop existing if running
pm2 delete aihealz 2>/dev/null || true

# Start with PM2
pm2 start npm --name "aihealz" -- start
pm2 save
pm2 startup

echo -e "${GREEN}✓ Application restarted${NC}"

# ── Step 11: Persist DB password to operator-only file ─────────────────────────
# Write the generated DB password to a 600-perm file for the operator to read,
# instead of echoing to stdout (which ends up in shell history / CI logs).
DB_PASS_FILE="${DEPLOY_PATH}/.db_password.generated"
umask 077
printf '%s\n' "$DB_PASSWORD" > "$DB_PASS_FILE"
chmod 600 "$DB_PASS_FILE"

# ── Summary ─────────────────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ SETUP COMPLETE!${NC}"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""
echo "Admin Login:"
echo "  URL:      https://aihealz.com/admin"
echo "  Email:    ${ADMIN_EMAIL}"
echo "  Password: (the ADMIN_PASSWORD you supplied — not printed)"
echo ""
echo "Database:"
echo "  Host:     localhost:5432"
echo "  Database: aihealz"
echo "  User:     aihealz_user"
echo "  Password: see ${DB_PASS_FILE} (delete this file after copying it to your secret store)"
echo ""
echo "Commands:"
echo "  pm2 status          - Check app status"
echo "  pm2 logs aihealz    - View app logs"
echo "  pm2 restart aihealz - Restart app"
echo ""
