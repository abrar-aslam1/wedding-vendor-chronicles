#!/bin/bash

# Run Instagram Vendor Collection Script
# This script applies the database migration and runs the Instagram vendor collection script

echo "Starting Instagram vendor collection process..."

# Check if Supabase is running
echo "Checking if Supabase is running..."
npx supabase status > /dev/null 2>&1

if [ $? -ne 0 ]; then
  echo "Error: Supabase is not running. This could be due to:"
  echo "  1. Docker Desktop is not installed or not running"
  echo "  2. Supabase local development server is not started"
  echo ""
  echo "To resolve this:"
  echo "  1. Make sure Docker Desktop is installed and running"
  echo "     Download from: https://www.docker.com/products/docker-desktop/"
  echo "  2. Start Supabase with: npx supabase start"
  echo ""
  echo "Alternative: If you're using a remote Supabase instance:"
  echo "  1. Update the connection settings in src/integrations/supabase/client.js"
  echo "  2. Apply the migration manually through the Supabase dashboard"
  echo "  3. Run the data collection script directly with: node scripts/data-collection/collect-instagram-vendors.js"
  echo ""
  read -p "Do you want to continue without local Supabase and run only the data collection script? (y/n) " answer
  if [ "$answer" != "y" ]; then
    exit 1
  fi
  
  echo "Continuing with data collection only..."
else
  echo "Supabase is running."

  # Apply the database migration
  echo "Applying database migration to create instagram_vendors table..."
  npx supabase migration up

  # Check if migration was successful
  if [ $? -ne 0 ]; then
    echo "Error: Database migration failed. Aborting."
    exit 1
  fi

  echo "Database migration applied successfully."
fi

# Step 2: Run the data collection script
echo "Running Instagram vendor collection script..."
node scripts/data-collection/collect-instagram-vendors.js

# Check if script execution was successful
if [ $? -ne 0 ]; then
  echo "Error: Instagram vendor collection script failed."
  exit 1
fi

echo "Instagram vendor collection completed successfully!"
