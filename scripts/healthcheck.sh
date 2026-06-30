#!/usr/bin/env bash
##############################################################
# healthcheck.sh — Service Health Monitor
# Phase 10: Deploy
#
# يتحقق من صحة:
#   - Backend API (/health endpoint)
#   - Frontend (HTTP 200)
#   - PostgreSQL (pg_isready)
#   - Redis (PING)
#   - Nginx (process check)
#   - Disk space (تحذير لو أكثر من 80%)
#   - SSL certificate expiry
#
# الاستخدام:
#   bash /opt/fa-arch/scripts/healthcheck.sh
#
# Exit codes:
#   0 = all healthy
#   1 = one or more services unhealthy
##############################################################

set -uo pipefail

# ── Config ────────────────────────────────────────────────
BACKEND_URL="http://localhost:3001/health"
FRONTEND_URL="https://fa-arch.cu.edu.eg"
ENV_FILE="/var/www/fa-arch-new/.env.prod"
DISK_THRESHOLD=80
SSL_WARN_DAYS=30

# ── Colors ────────────────────────────────────────────────
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0; FAIL=0

ok()   { echo -e "  ${GREEN}✅ $1${NC}"; }
fail() { echo -e "  ${RED}❌ $1${NC}"; FAIL=$((FAIL+1)); }
warn() { echo -e "  ${YELLOW}⚠️  $1${NC}"; }

echo ""
echo "════════════════════════════════════════════"
echo "  FA-Arch Health Check — $(date '+%Y-%m-%d %H:%M:%S')"
echo "════════════════════════════════════════════"

# ── 1. Backend API ────────────────────────────────────────
echo ""
echo "── Backend API"
if curl -sf --max-time 5 "$BACKEND_URL" > /dev/null 2>&1; then
  RESPONSE=$(curl -s --max-time 5 "$BACKEND_URL")
  ok "API responding: $RESPONSE"
else
  fail "Backend not responding at $BACKEND_URL"
fi

# ── 2. Frontend ───────────────────────────────────────────
echo ""
echo "── Frontend"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$FRONTEND_URL" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
  ok "Frontend responding (HTTP $HTTP_CODE)"
else
  fail "Frontend HTTP $HTTP_CODE"
fi

# ── 3. PostgreSQL ─────────────────────────────────────────
echo ""
echo "── PostgreSQL"
if docker exec fa_arch_postgres_prod pg_isready -U "${POSTGRES_USER:-fa_arch_user}" > /dev/null 2>&1; then
  ok "PostgreSQL accepting connections"
else
  fail "PostgreSQL not ready"
fi

# ── 4. Redis ──────────────────────────────────────────────
echo ""
echo "── Redis"
if [ -f "$ENV_FILE" ]; then
  # shellcheck disable=SC1090
  REDIS_PASS=$(grep REDIS_PASSWORD "$ENV_FILE" | cut -d= -f2 | tr -d '"' | tr -d "'" | head -1)
fi
REDIS_CMD="PING"
REDIS_RESP=$(docker exec fa_arch_redis_prod redis-cli -a "${REDIS_PASS:-}" PING 2>/dev/null || echo "FAIL")
if [ "$REDIS_RESP" = "PONG" ]; then
  ok "Redis PONG received"
else
  fail "Redis not responding (got: $REDIS_RESP)"
fi

# ── 5. Nginx ──────────────────────────────────────────────
echo ""
echo "── Nginx"
if docker exec fa_arch_nginx_prod nginx -t > /dev/null 2>&1; then
  ok "Nginx config valid and running"
else
  fail "Nginx config error"
fi

# ── 6. Disk Space ─────────────────────────────────────────
echo ""
echo "── Disk Space"
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')
if [ "$DISK_USAGE" -lt "$DISK_THRESHOLD" ]; then
  ok "Disk usage: ${DISK_USAGE}% (threshold: ${DISK_THRESHOLD}%)"
else
  warn "Disk usage high: ${DISK_USAGE}% — consider cleanup"
fi

# ── 7. Backup files ───────────────────────────────────────
echo ""
echo "── Backups"
LATEST_BACKUP=$(find /var/backups/fa-arch -name "*.sql.gz" -mtime -1 2>/dev/null | head -1)
if [ -n "$LATEST_BACKUP" ]; then
  ok "Latest backup found (within 24h): $(basename "$LATEST_BACKUP")"
else
  warn "No backup found in last 24 hours!"
fi

# ── 8. SSL Certificate ────────────────────────────────────
echo ""
echo "── SSL Certificate"
SSL_CERT="/var/www/fa-arch-new/nginx/ssl/cert.pem"
if [ -f "$SSL_CERT" ]; then
  EXPIRY=$(openssl x509 -enddate -noout -in "$SSL_CERT" 2>/dev/null | cut -d= -f2)
  EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s 2>/dev/null || date -j -f "%b %d %T %Y %Z" "$EXPIRY" +%s 2>/dev/null || echo "0")
  NOW_EPOCH=$(date +%s)
  DAYS_LEFT=$(( (EXPIRY_EPOCH - NOW_EPOCH) / 86400 ))
  if [ "$DAYS_LEFT" -gt "$SSL_WARN_DAYS" ]; then
    ok "SSL cert expires in ${DAYS_LEFT} days ($EXPIRY)"
  else
    warn "SSL cert expires in ${DAYS_LEFT} days — RENEW SOON!"
  fi
else
  warn "SSL cert not found at $SSL_CERT"
fi

# ── Summary ───────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════"
if [ "$FAIL" -eq 0 ]; then
  echo -e "  ${GREEN}✅ ALL CHECKS PASSED${NC}"
  echo "════════════════════════════════════════════"
  exit 0
else
  echo -e "  ${RED}❌ $FAIL CHECK(S) FAILED${NC}"
  echo "════════════════════════════════════════════"
  exit 1
fi
