#!/bin/bash

# Smart Verify E-commerce Microservices Manager

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}"
    echo "=========================================="
    echo "  Smart Verify E-commerce Services"
    echo "=========================================="
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Build all services
build_services() {
    print_header
    echo "🔨 Building all microservices..."
    
    # Build each service
    services=("auth-service" "product-service" "inventory-service" "order-service" "payment-service" "review-service" "favorite-service" "ai-agentic-service")
    
    for service in "${services[@]}"; do
        echo "Building $service..."
        docker build -t smart-verify-$service ./$service/
        print_success "$service built successfully"
    done
}

# Start all services
start_services() {
    print_header
    echo "🚀 Starting all services..."
    
    docker-compose up -d
    
    # Wait a bit for services to start
    echo "⏳ Waiting for services to start..."
    sleep 10
    
    # Check service health
    check_services_health
}

# Stop all services
stop_services() {
    print_header
    echo "🛑 Stopping all services..."
    
    docker-compose down
    print_success "All services stopped"
}

# Check services health
check_services_health() {
    echo "🏥 Checking services health..."
    
    services=(
        "auth-service:8001"
        "product-service:8002" 
        "inventory-service:8003"
        "order-service:8004"
        "payment-service:8005"
        "review-service:8006"
        "favorite-service:8007"
        "ai-agentic-service:8008"
    )
    
    for service in "${services[@]}"; do
        name=$(echo $service | cut -d: -f1)
        port=$(echo $service | cut -d: -f2)
        
        if curl -s http://localhost:$port/health > /dev/null; then
            print_success "$name is healthy"
        else
            print_warning "$name is not responding"
        fi
    done
}

# Setup databases
setup_databases() {
    print_header
    echo "🗄️  Setting up databases..."
    
    # Start only database services first
    docker-compose up -d auth-db product-db inventory-db order-db payment-db review-db favorite-db ai-agentic-db
    
    echo "⏳ Waiting for databases to be ready..."
    sleep 15
    
    # Run Alembic migrations for each service
    services=("auth-service" "product-service" "inventory-service" "order-service" "payment-service" "review-service" "favorite-service" "ai-agentic-service")
    
    for service in "${services[@]}"; do
        echo "Running migrations for $service..."
        cd $service
        # In production, you would run: alembic upgrade head
        echo "Migrations for $service would run here"
        cd ..
    done
    
    print_success "Databases setup completed"
    cd ..
}

# Seed sample data
seed_data() {
    print_header
    echo "🌱 Seeding sample data..."
    
    python seed_data.py
    
    print_success "Sample data seeded successfully"
}

# View logs
view_logs() {
    docker-compose logs -f
}

# Show service URLs
show_urls() {
    print_header
    echo "🌐 Service URLs:"
    echo ""
    echo "� Auth Service:      http://localhost:8001"
    echo "📦 Product Service:   http://localhost:8002"
    echo "📋 Inventory Service: http://localhost:8003"
    echo "🛒 Order Service:     http://localhost:8004"
    echo "💳 Payment Service:   http://localhost:8005"
    echo "⭐ Review Service:    http://localhost:8006"
    echo "❤️  Favorite Service: http://localhost:8007"
    echo "🤖 AI Agentic Service: http://localhost:8008"
    echo "🧠 MindsDB:          http://localhost:47334"
    echo ""
    echo "📊 Health Check URLs:"
    echo "   http://localhost:8001/health"
    echo "   http://localhost:8002/health"
    echo "   http://localhost:8003/health"
    echo "   http://localhost:8004/health"
    echo "   http://localhost:8005/health"
    echo "   http://localhost:8006/health"
    echo "   http://localhost:8007/health"
    echo "   http://localhost:8008/health"
}

# Main menu
show_menu() {
    print_header
    echo "Please select an option:"
    echo ""
    echo "1) 🔨 Build all services"
    echo "2) 🗄️  Setup databases"
    echo "3) 🚀 Start all services"
    echo "4) 🛑 Stop all services"
    echo "5) 🌱 Seed sample data"
    echo "6) 🏥 Check services health"
    echo "7) 📋 View logs"
    echo "8) 🌐 Show service URLs"
    echo "9) 🔄 Full setup (build + start + seed)"
    echo "0) ❌ Exit"
    echo ""
}

# Full setup
full_setup() {
    check_docker
    build_services
    setup_databases
    start_services
    sleep 5
    seed_data
    show_urls
    print_success "Full setup completed! 🎉"
}

# Main script
main() {
    check_docker
    
    if [ $# -eq 0 ]; then
        while true; do
            show_menu
            read -p "Enter your choice [0-9]: " choice
            case $choice in
                1) build_services ;;
                2) setup_databases ;;
                3) start_services ;;
                4) stop_services ;;
                5) seed_data ;;
                6) check_services_health ;;
                7) view_logs ;;
                8) show_urls ;;
                9) full_setup ;;
                0) echo "Goodbye! 👋"; exit 0 ;;
                *) print_error "Invalid option. Please try again." ;;
            esac
            echo ""
            read -p "Press Enter to continue..."
        done
    else
        case $1 in
            build) build_services ;;
            setup) setup_databases ;;
            start) start_services ;;
            stop) stop_services ;;
            seed) seed_data ;;
            health) check_services_health ;;
            logs) view_logs ;;
            urls) show_urls ;;
            full) full_setup ;;
            *) 
                echo "Usage: $0 {build|setup|start|stop|seed|health|logs|urls|full}"
                exit 1
            ;;
        esac
    fi
}

# Run main function
main "$@"
