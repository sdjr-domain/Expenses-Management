#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Spendly Backend...${NC}"
# Start Flask in the background
# We use the venv python directly to avoid needing 'source'
./venv/bin/python app.py & 
BACKEND_PID=$!

echo -e "${BLUE}Starting Spendly Frontend...${NC}"
# Start React frontend
# --prefix allows running npm commands in a subfolder
npm run dev --prefix frontend

# When the frontend is stopped (Ctrl+C), kill the backend too
trap "kill $BACKEND_PID" EXIT
