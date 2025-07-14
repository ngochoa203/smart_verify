#!/bin/bash

# Quick Start Script for Smart Verify E-commerce
# This script will get you up and running in minutes!

echo "🚀 Smart Verify E-commerce - Quick Start"
echo "========================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

echo "✅ Docker is available"
echo ""

# Navigate to backend directory
cd backend

# Make manage script executable
chmod +x manage.sh

echo "🏗️  Starting full setup..."
echo "This will:"
echo "  1. Build all microservices"
echo "  2. Setup PostgreSQL databases"
echo "  3. Start all services"
echo "  4. Seed sample data"
echo ""
echo "⏳ This may take a few minutes on first run..."
echo ""

# Run full setup
./manage.sh full

echo ""
echo "🎉 Smart Verify E-commerce is now running!"
echo ""
echo "📊 Access your services:"
echo "   • User Service:      http://localhost:8001"
echo "   • Product Service:   http://localhost:8002" 
echo "   • Review Service:    http://localhost:8003"
echo "   • Order Service:     http://localhost:8004"
echo "   • AI Risk Service:   http://localhost:8005"
echo "   • MindsDB:          http://localhost:47334"
echo ""
echo "🏥 Health checks:"
echo "   curl http://localhost:8001/health"
echo "   curl http://localhost:8002/health"
echo ""
echo "🛑 To stop all services:"
echo "   ./manage.sh stop"
echo ""
echo "💡 For more options:"
echo "   ./manage.sh"
echo ""
echo "Happy coding! 🎉"
