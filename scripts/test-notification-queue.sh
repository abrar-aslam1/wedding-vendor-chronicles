#!/bin/bash

# Test script for notification queue processing with proper authentication
# This script tests the same call that the cron job will make

echo "🧪 Testing notification queue processing with authentication..."
echo "============================================================"

# Supabase configuration
SUPABASE_URL="https://wpbdveyuuudhmwflrmqw.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A"
FUNCTION_URL="${SUPABASE_URL}/functions/v1/process-notification-queue"

echo "📍 Function URL: $FUNCTION_URL"
echo "🔑 Using anon key authentication"
echo ""

# Make the authenticated request
echo "🚀 Making authenticated request to notification queue processor..."
response=$(curl -s -w "%{http_code}" -X POST "$FUNCTION_URL" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "apikey: $SUPABASE_ANON_KEY")

# Extract HTTP status code (last 3 characters)
http_code="${response: -3}"
# Extract response body (everything except last 3 characters)
response_body="${response%???}"

echo "📊 Response Status: $http_code"
echo "📝 Response Body: $response_body"
echo ""

# Check if the request was successful
if [ "$http_code" -eq 200 ]; then
    echo "✅ SUCCESS: Notification queue processed successfully!"
    echo "🎉 Your cron job configuration is correct!"
else
    echo "❌ FAILED: HTTP Status $http_code"
    echo "🔍 This indicates the cron job will fail with this configuration"
    
    if [ "$http_code" -eq 401 ]; then
        echo "🔐 Authentication issue - check your API key"
    elif [ "$http_code" -eq 500 ]; then
        echo "🔧 Server error - check function logs in Supabase"
    fi
fi

echo ""
echo "============================================================"
echo "🔧 Cron Job Configuration for cron-job.org:"
echo "============================================================"
echo ""
echo "URL: $FUNCTION_URL"
echo "Method: POST"
echo "Headers:"
echo "  Authorization: Bearer $SUPABASE_ANON_KEY"
echo "  Content-Type: application/json"
echo "  apikey: $SUPABASE_ANON_KEY"
echo ""
echo "Command for testing locally:"
echo "curl -X POST '$FUNCTION_URL' \\"
echo "  -H 'Authorization: Bearer $SUPABASE_ANON_KEY' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'apikey: $SUPABASE_ANON_KEY'"
echo ""
echo "============================================================"