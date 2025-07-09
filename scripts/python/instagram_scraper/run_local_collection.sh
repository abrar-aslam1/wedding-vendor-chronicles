#!/bin/bash

# Local Vendor Collection Runner Script
# Activates virtual environment and runs the local collection deployment

echo "🏪 LOCAL VENDOR COLLECTION RUNNER"
echo "================================="

# Navigate to the script directory
cd "$(dirname "$0")"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Creating one..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    echo "✅ Activating virtual environment..."
    source venv/bin/activate
fi

# Display Python version
echo "Python version: $(python --version)"

# Check if deployment script exists
if [ ! -f "deploy_local_collection.py" ]; then
    echo "❌ Error: deploy_local_collection.py not found!"
    exit 1
fi

# Check if local collector exists
if [ ! -f "local_vendor_collector.py" ]; then
    echo "❌ Error: local_vendor_collector.py not found!"
    exit 1
fi

# Run the deployment script with optional configuration parameter
if [ -z "$1" ]; then
    echo ""
    echo "Available collection configurations:"
    echo "  - test: Quick test with Dallas photographers and makeup artists"
    echo "  - texas_priority: Top 5 Texas cities with 5 vendor categories"
    echo "  - texas_full: 10 Texas cities with 8 vendor categories"
    echo "  - national_tier1: Top 8 US markets with priority categories"
    echo ""
    echo "Usage: ./run_local_collection.sh [configuration]"
    echo "Example: ./run_local_collection.sh test"
    echo ""
    python deploy_local_collection.py
else
    echo ""
    echo "Running with configuration: $1"
    python deploy_local_collection.py "$1"
fi

# Deactivate virtual environment
deactivate

echo ""
echo "✅ Collection runner completed!"