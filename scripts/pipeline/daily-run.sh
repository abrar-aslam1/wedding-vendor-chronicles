#!/bin/bash
# Daily Instagram Vendor Discovery Pipeline
# Runs tier 1 daily, tier 2 weekly (Sundays)

set -euo pipefail

cd "$(dirname "$0")/../.."
source .env 2>/dev/null || true

LOG_DIR="logs"
mkdir -p "$LOG_DIR"
DATE=$(date +%Y-%m-%d)
LOG_FILE="$LOG_DIR/pipeline-${DATE}.log"

echo "=== Pipeline run started at $(date) ===" >> "$LOG_FILE"

DAY_OF_WEEK=$(date +%u) # 1=Mon, 7=Sun

# Always run tier 1
echo "[$(date)] Running tier 1..." >> "$LOG_FILE"
node scripts/pipeline/run-pipeline.js --tier 1 --limit 10 >> "$LOG_FILE" 2>&1

# On Sundays, also run tier 2
if [ "$DAY_OF_WEEK" -eq 7 ]; then
  echo "[$(date)] Sunday — running tier 2..." >> "$LOG_FILE"
  node scripts/pipeline/run-pipeline.js --tier 2 --limit 10 >> "$LOG_FILE" 2>&1
fi

# Backfill any missing subcategories
echo "[$(date)] Backfilling subcategories..." >> "$LOG_FILE"
node scripts/pipeline/backfill-subcategories.js >> "$LOG_FILE" 2>&1

echo "=== Pipeline run completed at $(date) ===" >> "$LOG_FILE"

# Clean up logs older than 30 days
find "$LOG_DIR" -name "pipeline-*.log" -mtime +30 -delete 2>/dev/null || true
