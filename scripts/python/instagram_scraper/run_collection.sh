#!/bin/bash

# Wedding Vendor Instagram Collection Runner
# This script provides an easy interface to run the Python Instagram scraper

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Virtual environment not found. Creating...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Check if dependencies are installed
if ! python -c "import supabase" 2>/dev/null; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    pip install -r requirements.txt
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo "Please copy .env.example to .env and add your credentials:"
    echo "  cp .env.example .env"
    exit 1
fi

# Parse command line arguments
case "$1" in
    "all")
        echo -e "${GREEN}Starting full collection for all categories...${NC}"
        python enterprise_collection.py collect-all
        ;;
    "makeup")
        echo -e "${GREEN}Collecting makeup artists...${NC}"
        python enterprise_collection.py collect-category makeup-artists
        ;;
    "hair")
        echo -e "${GREEN}Collecting hair stylists...${NC}"
        python enterprise_collection.py collect-category hair-stylists
        ;;
    "test")
        echo -e "${GREEN}Running test collection with limited scope...${NC}"
        python enterprise_collection.py collect-hashtags makeup-artists "#dallasmua"
        ;;
    "comprehensive-test")
        echo -e "${GREEN}Testing comprehensive collection system...${NC}"
        python deploy_comprehensive.py test
        ;;
    "comprehensive-priority")
        echo -e "${GREEN}Running priority categories collection...${NC}"
        python deploy_comprehensive.py priority
        ;;
    "comprehensive-full")
        echo -e "${GREEN}Running FULL comprehensive collection (ALL 12 CATEGORIES)...${NC}"
        python deploy_comprehensive.py full
        ;;
    "plan")
        echo -e "${GREEN}Showing comprehensive collection plan...${NC}"
        python deploy_comprehensive.py plan
        ;;
    "docker")
        echo -e "${GREEN}Starting Docker deployment...${NC}"
        docker-compose up -d
        echo -e "${GREEN}Container started. View logs with: docker-compose logs -f${NC}"
        ;;
    "stop")
        echo -e "${YELLOW}Stopping Docker deployment...${NC}"
        docker-compose down
        ;;
    *)
        echo "Wedding Vendor Instagram Collection"
        echo "Usage: ./run_collection.sh [command]"
        echo ""
        echo "BASIC COMMANDS:"
        echo "  all     - Collect all categories (makeup artists & hair stylists)"
        echo "  makeup  - Collect only makeup artists"
        echo "  hair    - Collect only hair stylists"
        echo "  test    - Run a small test collection"
        echo ""
        echo "COMPREHENSIVE COMMANDS (ALL 12 CATEGORIES):"
        echo "  plan                    - Show comprehensive collection plan"
        echo "  comprehensive-test      - Test enhanced system (3 categories × 3 cities)"
        echo "  comprehensive-priority  - Collect priority categories (photographers, venues, florists)"
        echo "  comprehensive-full      - Collect ALL 12 categories × 20 cities (~4,800 vendors)"
        echo ""
        echo "DEPLOYMENT:"
        echo "  docker  - Start Docker deployment"
        echo "  stop    - Stop Docker deployment"
        echo ""
        echo "EXAMPLES:"
        echo "  ./run_collection.sh plan                    # See the comprehensive plan"
        echo "  ./run_collection.sh comprehensive-test      # Test the enhanced system"
        echo "  ./run_collection.sh comprehensive-priority  # Collect high-priority categories"
        echo "  ./run_collection.sh comprehensive-full      # Full deployment (ALL categories)"
        exit 1
        ;;
esac

# Deactivate virtual environment
deactivate