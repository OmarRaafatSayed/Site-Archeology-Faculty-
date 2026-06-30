#!/usr/bin/env bash
##############################################################
# backup.sh — Daily PostgreSQL Backup
# Phase 10: Deploy
#
# الاستخدام:
#   bash /opt/fa-arch/scripts/backup.sh
#
# يحفظ النسخة في: /var/backups/fa-arch/
# يحتفظ بـ 30 يوم فقط (auto-cleanup)
# يُضاف لـ crontab:
#   0 3 * * * bash /opt/fa-arch/scripts/backup.sh >> /var/log/fa-arch-backup.log 2>&1
##############################################################

set -euo pipefail

# ── Config ────────────────────────────────────────────────
BACKUP_DIR="/var/backups/fa-arch"
COMPOSE_FILE="/var/www/fa-arch-new/docker-compose.prod.yml"
ENV_FILE="/var/www/fa-arch-new/.env.prod"
CONTAINER="fa_arch_postgres_prod"
RETENTION_DAYS=30
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/fa_arch_${TIMESTAMP}.sql.gz"

# ── Colors ────────────────────────────────────────────────
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[$(date '+%H:%M:%S')] $1${NC}"; }
warn() { echo -e "${YELLOW}[$(date '+%H:%M:%S')] ⚠️  $1${NC}"; }
err()  { echo -e "${RED}[$(date '+%H:%M:%S')] ❌ $1${NC}" >&2; }

# ── Load env vars ─────────────────────────────────────────
if [ -f "$ENV_FILE" ]; then
  # shellcheck disable=SC1090
  set -a; source "$ENV_FILE"; set +a
else
  err "Env file not found: $ENV_FILE"
  exit 1
fi

POSTGRES_USER="${POSTGRES_USER:-fa_arch_user}"
POSTGRES_DB="${POSTGRES_DB:-fa_arch_db}"

# ── Create backup directory ───────────────────────────────
mkdir -p "$BACKUP_DIR"

log "Starting backup: $BACKUP_FILE"

# ── Run pg_dump inside the container ─────────────────────
if docker exec "$CONTAINER" \
    pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
    --format=plain --no-owner --no-acl \
    | gzip > "$BACKUP_FILE"; then
  SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
  log "✅ Backup complete — size: $SIZE"
else
  err "pg_dump failed!"
  rm -f "$BACKUP_FILE"
  exit 1
fi

# ── Cleanup old backups ───────────────────────────────────
log "Cleaning backups older than ${RETENTION_DAYS} days..."
find "$BACKUP_DIR" -name "fa_arch_*.sql.gz" \
    -mtime "+${RETENTION_DAYS}" -delete
REMAINING=$(find "$BACKUP_DIR" -name "fa_arch_*.sql.gz" | wc -l)
log "Backup files retained: $REMAINING"

# ── Verify backup is readable ─────────────────────────────
if gzip -t "$BACKUP_FILE" 2>/dev/null; then
  log "✅ Backup integrity verified"
else
  err "Backup file is corrupt!"
  exit 1
fi

log "Backup finished: $BACKUP_FILE"
