#!/bin/bash

# This script sets up a cron job to run the SEO health check weekly
# and send an email notification if any issues are found.
#
# Usage:
#   ./setup-seo-cron.sh [email]
#
# Example:
#   ./setup-seo-cron.sh admin@findmyweddingvendor.com

# Get the project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EMAIL=${1:-"admin@findmyweddingvendor.com"}

# Create the cron job script
CRON_SCRIPT="$PROJECT_DIR/scripts/run-seo-check.sh"

cat > "$CRON_SCRIPT" << EOL
#!/bin/bash

# Run the SEO health check
cd "$PROJECT_DIR"
OUTPUT=\$(npm run check-seo-health)
EXIT_CODE=\$?

# If the health check failed, send an email
if [ \$EXIT_CODE -ne 0 ]; then
  echo "\$OUTPUT" | mail -s "SEO Health Check Failed" "$EMAIL"
  echo "SEO Health Check failed. Email sent to $EMAIL."
  exit 1
else
  echo "SEO Health Check passed."
  exit 0
fi
EOL

# Make the script executable
chmod +x "$CRON_SCRIPT"

# Add the cron job to run weekly (Sunday at midnight)
(crontab -l 2>/dev/null || echo "") | grep -v "$CRON_SCRIPT" | { cat; echo "0 0 * * 0 $CRON_SCRIPT"; } | crontab -

echo "Cron job set up to run SEO health check weekly and send notifications to $EMAIL"
echo "You can edit the cron schedule by running 'crontab -e'"
echo "The current schedule is: Every Sunday at midnight"
