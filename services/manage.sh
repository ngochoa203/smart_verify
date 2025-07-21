#!/bin/bash

# Smart Verify E-commerce Microservices Manager (Revised)
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Fixed service names
services=(
    "auth-service"
    "product-service"
    "inventory-service"
    "order-service"
    "payment-service"
    "review-service"
    "favorite-service"
    "ai-agentic-service"
    "cart-service"
)

ports=(
    8001
    8002
    8003
    8004
    8005
    8006
    8007
    8008
    8009
)

print_header() {
    echo -e "${BLUE}==========================================
  Smart Verify E-commerce Services
==========================================${NC}"
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

check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

remove_dangling_images() {
    print_header
    echo "🧹 Removing dangling (none) images..."
    docker image prune -f
    print_success "Dangling images removed."
}

remove_all_images() {
    print_header
    echo -e "${RED}⚠️  This will remove ALL Docker images from your system!${NC}"
    read -p "Are you sure you want to delete ALL Docker images? [y/N]: " confirm
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        docker rmi -f $(docker images -aq) || true
        print_success "All Docker images have been removed."
    else
        print_warning "Aborted. No images were removed."
    fi
}

build_services() {
    print_header
    echo "🔨 Building all microservices..."
    for service in "${services[@]}"; do
        dir="${service/sv-/}"
        echo "Building $service (./$dir/)..."
        docker build -t $service ./$dir/
        print_success "$service built successfully"
    done
}

start_services() {
    print_header
    echo "🚀 Starting all services..."
    # Start all services explicitly
    docker-compose up -d ${services[@]}
    echo "⏳ Waiting for services to start..."
    sleep 10
    check_services_health
}

stop_services() {
    print_header
    echo "🛑 Stopping all services..."
    docker-compose down
    print_success "All services stopped"
}

select_service() {
    echo "Select a service:" >&2
    for i in "${!services[@]}"; do
        echo "$((i+1))) ${services[$i]}" >&2
    done
    read -p "Enter number [1-${#services[@]}]: " idx
    if [[ "$idx" =~ ^[0-9]+$ ]] && [ "$idx" -ge 1 ] && [ "$idx" -le ${#services[@]} ]; then
        echo "${services[$((idx-1))]}"
    else
        print_error "Invalid selection" >&2
        exit 1
    fi
}

start_service() {
    sname=$(select_service)
    docker-compose up -d $sname
    print_success "$sname started"
}

stop_service() {
    sname=$(select_service)
    docker-compose stop $sname
    print_success "$sname stopped"
}

logs_service() {
    sname=$(select_service)
    docker-compose logs -f $sname
}

check_services_health() {
    echo "🏥 Checking services health..."
    for i in "${!services[@]}"; do
        name="${services[$i]}"
        port="${ports[$i]}"
        if curl -s http://localhost:$port/health > /dev/null; then
            print_success "$name is healthy (port $port)"
        else
            print_warning "$name is not responding (port $port)"
        fi
    done
}

setup_databases() {
    print_header
    echo "🗄️  Setting up databases..."
    docker-compose up -d auth-db product-db inventory-db order-db payment-db review-db favorite-db ai-agentic-db cart-db
    echo "⏳ Waiting for databases to be ready..."
    sleep 15
    
    # Initialize schemas
    echo "Initializing database schemas..."
    ./init_schemas.sh
    
    # Run migrations
    for service in "${services[@]}"; do
        echo "Running migrations for $service..."
        if [ -d "$service/alembic" ]; then
            cd $service
            echo "Running alembic migrations..."
            # In production: alembic upgrade head
            echo "Migrations for $service would run here"
            cd ..
        else
            echo "No alembic directory found for $service, skipping migrations"
        fi
    done
    print_success "Databases setup completed"
}

seed_data() {
    print_header
    echo "🌱 Seeding sample data..."
    python seed_data.py
    print_success "Sample data seeded successfully"
}

view_logs() {
    docker-compose logs -f
}

show_urls() {
    print_header
    echo "🌐 Service URLs:"
    echo ""
    echo "🔑 Auth Service:      http://localhost:8001"
    echo "📦 Product Service:   http://localhost:8002"
    echo "📋 Inventory Service: http://localhost:8003"
    echo "🛒 Order Service:     http://localhost:8004"
    echo "💳 Payment Service:   http://localhost:8005"
    echo "⭐ Review Service:    http://localhost:8006"
    echo "❤️  Favorite Service: http://localhost:8007"
    echo "🤖 AI Agentic Service: http://localhost:8008"
    echo "🛍️  Cart Service:     http://localhost:8009"
    echo "🧠 MindsDB:          http://localhost:47334"
    echo ""
    echo "📊 Health Check URLs:"
    for port in "${ports[@]}"; do
        echo "   http://localhost:$port/health"
    done
}

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
    echo "9) 🧹 Remove dangling images"
    echo "10) ▶️  Start a service"
    echo "11) ⏹️  Stop a service"
    echo "12) 📝 Logs for a service"
    echo "0) ❌ Exit"
    echo ""
}

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

main() {
    check_docker
    if [ $# -eq 0 ]; then
        while true; do
            show_menu
            read -p "Enter your choice [0-12]: " choice
            case $choice in
                1) build_services ;;
                2) setup_databases ;;
                3) start_services ;;
                4) stop_services ;;
                5) seed_data ;;
                6) check_services_health ;;
                7) view_logs ;;
                8) show_urls ;;
                9) remove_dangling_images ;;
                10)
                    start_service
                    ;;
                11)
                    stop_service
                    ;;
                12)
                    logs_service
                    ;;
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
            prune) remove_dangling_images ;;
            start-service) start_service ;;
            stop-service) stop_service ;;
            logs-service) logs_service ;;
            full) full_setup ;;
            remove-all-images) remove_all_images ;;
            *)
                echo "Usage: $0 {build|setup|start|stop|seed|health|logs|urls|prune|start-service <name>|stop-service <name>|logs-service <name>|full|remove-all-images}"
                exit 1
            ;;
        esac
    fi
}

main "$@"