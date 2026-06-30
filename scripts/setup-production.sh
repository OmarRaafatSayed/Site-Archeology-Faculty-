#!/usr/bin/env bash
##############################################################
# setup-production.sh — First-time Server Setup
# Phase 10: Deploy
#
# يُشغَّل مرة واحدة فقط على السيرفر الجديد
# يثبّت: Docker + Docker Compose + Nginx + Certbot + cron jobs
#
# الاستخدام (على Ubuntu 22.04/24.04):
#   sudo bash /opt/fa-arch/scripts/setup-production.sh
##############################################################

set -euo pipefail

# ── Config ────────────────────────────────────────────────
DOMAIN="fa-arch.cu.edu.eg"
APP_DIR="/var/www/fa-arch-new"
SCRIPTS_DIR="/opt/fa-arch/scripts"
BACKUP_DIR="/var/backups/fa-arch"
LOG_DIR="/var/log/fa-arch"
GIT_REPO="https://github.com/OmarRaafatSayed/Site-Archeology-Faculty-.git"

# ── Colors ────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}[SETUP] $1${NC}"; }
step() { echo -e "\n${YELLOW}━━━ $1 ━━━${NC}"; }

# Must run as root
if [ "$(id -u)" != "0" ]; then
  echo "Run as root: sudo bash $0"; exit 1
fi

step "1. Update system packages"
apt-get update -qq
apt-get upgrade -y -qq

step "2. Install essentials"
apt-get install -y -qq \
  curl git wget unzip openssl \
  ca-certificates gnupg lsb-release \
  ufw fail2ban logrotate cron

step "3. Install Docker"
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
  log "Docker installed"
else
  log "Docker already installed: $(docker --version)"
fi

step "4. Install Docker Compose plugin"
docker compose version &>/dev/null || \
  apt-get install -y docker-compose-plugin
log "Docker Compose: $(docker compose version)"

step "5. Install Certbot (Let's Encrypt)"
apt-get install -y certbot python3-certbot-nginx
log "Certbot installed"

step "6. Configure Firewall"
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
log "UFW configured"

step "7. Configure Fail2Ban"
cat > /etc/fail2ban/jail.local <<'EOF'
[DEFAULT]
bantime  = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port    = ssh
logpath = %(sshd_log)s

[nginx-http-auth]
enabled = true
EOF
systemctl enable fail2ban
systemctl restart fail2ban
log "Fail2Ban configured"

step "8. Create directories"
mkdir -p "$APP_DIR" "$SCRIPTS_DIR" "$BACKUP_DIR" "$LOG_DIR"
mkdir -p "$APP_DIR/nginx/ssl"
log "Directories created"

step "9. Clone repository"
if [ ! -d "$APP_DIR/.git" ]; then
  git clone "$GIT_REPO" "$APP_DIR"
  log "Repository cloned"
else
  cd "$APP_DIR" && git pull origin main
  log "Repository updated"
fi

step "10. Copy scripts to /opt"
cp -r "$APP_DIR/scripts/." "$SCRIPTS_DIR/"
chmod +x "$SCRIPTS_DIR/"*.sh
log "Scripts installed to $SCRIPTS_DIR"

step "11. Setup cron jobs"
CRON_FILE="/etc/cron.d/fa-arch"
cat > "$CRON_FILE" <<EOF
# FA-Arch Maintenance Jobs
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

# Daily backup at 03:00
0 3 * * * root bash ${SCRIPTS_DIR}/backup.sh >> ${LOG_DIR}/backup.log 2>&1

# Health check every 5 minutes
*/5 * * * * root bash ${SCRIPTS_DIR}/healthcheck.sh >> ${LOG_DIR}/healthcheck.log 2>&1

# SSL cert auto-renewal check twice daily
0 0,12 * * * root certbot renew --quiet --post-hook "docker exec fa_arch_nginx_prod nginx -s reload" >> ${LOG_DIR}/certbot.log 2>&1
EOF
chmod 644 "$CRON_FILE"
log "Cron jobs installed"

step "12. Configure log rotation"
cat > /etc/logrotate.d/fa-arch <<EOF
${LOG_DIR}/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0640 root root
}
EOF
log "Log rotation configured"

step "13. Obtain SSL certificate"
echo ""
echo "  ⚠️  Ensure DNS A record: $DOMAIN → $(curl -s ifconfig.me)"
echo "  Run: certbot certonly --nginx -d $DOMAIN -d www.$DOMAIN"
echo "  Then copy certs:"
echo "    cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $APP_DIR/nginx/ssl/cert.pem"
echo "    cp /etc/letsencrypt/live/$DOMAIN/privkey.pem   $APP_DIR/nginx/ssl/key.pem"
echo "    cp /etc/letsencrypt/live/$DOMAIN/chain.pem     $APP_DIR/nginx/ssl/chain.pem"
echo ""

step "14. Setup .env.prod"
if [ ! -f "$APP_DIR/.env.prod" ]; then
  cp "$APP_DIR/.env.prod.example" "$APP_DIR/.env.prod"
  echo ""
  echo "  ⚠️  Edit .env.prod with production values:"
  echo "    nano $APP_DIR/.env.prod"
  echo ""
else
  log ".env.prod already exists"
fi

step "15. Initial database seed (after services start)"
echo ""
echo "  After docker compose up, run:"
echo "    docker compose -f $APP_DIR/docker-compose.prod.yml --env-file $APP_DIR/.env.prod \\"
echo "      run --rm backend npx prisma migrate deploy"
echo "    docker compose -f $APP_DIR/docker-compose.prod.yml --env-file $APP_DIR/.env.prod \\"
echo "      run --rm backend npx ts-node prisma/seed.production.ts"
echo ""

echo ""
echo "═══════════════════════════════════════════════"
echo -e "${GREEN}✅ Server setup complete!${NC}"
echo ""
echo "  Next steps:"
echo "  1. Edit $APP_DIR/.env.prod"
echo "  2. Obtain SSL certificate (step 13)"
echo "  3. docker compose -f docker-compose.prod.yml --env-file .env.prod up -d"
echo "  4. Run DB migrations + seed"
echo "  5. bash $SCRIPTS_DIR/healthcheck.sh"
echo "═══════════════════════════════════════════════"
