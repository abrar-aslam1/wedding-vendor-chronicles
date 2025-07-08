#!/bin/bash

# Instagram Scraper Setup Script
# This script helps set up the Python environment for the Instagram scraper

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Wedding Vendor Instagram Scraper Setup${NC}"
echo "======================================"

# Check Python version
echo -e "\n${YELLOW}Checking Python version...${NC}"
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
    echo -e "${GREEN}✓ Python $PYTHON_VERSION found${NC}"
else
    echo -e "${RED}✗ Python 3 not found. Please install Python 3.9 or later.${NC}"
    exit 1
fi

# Create virtual environment
echo -e "\n${YELLOW}Creating virtual environment...${NC}"
python3 -m venv venv
echo -e "${GREEN}✓ Virtual environment created${NC}"

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo -e "\n${YELLOW}Installing dependencies...${NC}"
pip install --upgrade pip
pip install -r requirements.txt
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Check for .env file
echo -e "\n${YELLOW}Checking configuration...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env file with your credentials:${NC}"
    echo "   - SUPABASE_URL"
    echo "   - SUPABASE_SERVICE_KEY"
    echo "   - APIFY_TOKEN"
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi

# Make run script executable
chmod +x run_collection.sh
echo -e "${GREEN}✓ Run script made executable${NC}"

# Test imports
echo -e "\n${YELLOW}Testing Python imports...${NC}"
python -c "
import supabase
import requests
import schedule
import asyncio
print('✓ All required modules imported successfully')
" && echo -e "${GREEN}✓ Import test passed${NC}" || echo -e "${RED}✗ Import test failed${NC}"

# Deactivate virtual environment
deactivate

echo -e "\n${GREEN}Setup complete!${NC}"
echo -e "\nNext steps:"
echo -e "1. Edit ${BLUE}.env${NC} file with your credentials"
echo -e "2. Run ${BLUE}./run_collection.sh test${NC} to test the setup"
echo -e "3. Run ${BLUE}./run_collection.sh all${NC} to start full collection"
echo -e "\nFor more information, see README.md"