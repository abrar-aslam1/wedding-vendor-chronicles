#!/bin/bash

# Instagram Vendor Automation Setup Script
# This script installs the automation schedule and sets up required directories

set -e

echo "🚀 Setting up Instagram Vendor Automation..."

# Create required directories
mkdir -p logs
mkdir -p automations/approvals

# Create logs directory and initial files
touch logs/automation.log
touch logs/approval.log

echo "📁 Created directory structure"

# Install the cron job
if command -v crontab &> /dev/null; then
    echo "📅 Installing cron schedule..."
    
    # Backup existing crontab
    crontab -l > crontab.backup 2>/dev/null || true
    
    # Add our automation schedule
    (crontab -l 2>/dev/null; cat automations/instagram-automation.cron) | crontab -
    
    echo "✅ Cron schedule installed successfully"
    echo "📝 Backup of previous crontab saved to: crontab.backup"
else
    echo "⚠️  crontab not found - you'll need to manually schedule the automations"
    echo "📄 Generated schedule file: automations/instagram-automation.cron"
fi

echo "🎉 Automation setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Review the schedule: automations/instagram-automation.cron"
echo "2. Enable specific city backfills by editing the schedule"
echo "3. Set up approval notifications"
echo "4. Monitor logs: tail -f logs/automation.log"
echo ""
echo "🔧 To modify schedule: crontab -e"
echo "📊 To view current schedule: crontab -l"
