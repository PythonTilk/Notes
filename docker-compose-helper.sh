#!/bin/bash

# Docker Compose Helper Script for NoteVault
# This script provides easy commands for managing the Docker Compose setup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if .env.local exists
check_env_file() {
    if [ ! -f ".env.local" ]; then
        print_warning ".env.local not found. Creating from .env.example..."
        cp .env.example .env.local
        print_success "Created .env.local from .env.example"
        print_warning "Please review and update .env.local with your settings"
    fi
}

# Function to show help
show_help() {
    echo "NoteVault Docker Compose Helper"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start       Start all services"
    echo "  stop        Stop all services"
    echo "  restart     Restart all services"
    echo "  build       Build the application"
    echo "  rebuild     Rebuild with no cache"
    echo "  logs        Show logs for all services"
    echo "  logs-app    Show application logs"
    echo "  logs-db     Show database logs"
    echo "  status      Show status of all services"
    echo "  clean       Stop and remove all containers and volumes (WARNING: deletes data)"
    echo "  reset       Complete reset - rebuild everything from scratch"
    echo "  db          Access PostgreSQL database"
    echo "  setup       Initial setup - create .env.local and start services"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 setup     # First time setup"
    echo "  $0 start     # Start all services"
    echo "  $0 logs-app  # View application logs"
    echo "  $0 rebuild   # Rebuild if you encounter issues"
}

# Main script logic
case "${1:-help}" in
    "setup")
        print_status "Setting up NoteVault with Docker Compose..."
        check_env_file
        print_status "Building and starting services..."
        docker compose up -d --build
        print_success "Setup complete!"
        print_status "Access your application at: http://localhost:12000"
        print_status "You'll be redirected to setup page to create admin account"
        ;;
    
    "start")
        print_status "Starting NoteVault services..."
        check_env_file
        docker compose up -d
        print_success "Services started!"
        print_status "Access your application at: http://localhost:12000"
        ;;
    
    "stop")
        print_status "Stopping NoteVault services..."
        docker compose down
        print_success "Services stopped!"
        ;;
    
    "restart")
        print_status "Restarting NoteVault services..."
        docker compose restart
        print_success "Services restarted!"
        ;;
    
    "build")
        print_status "Building NoteVault application..."
        docker compose build app
        print_success "Build complete!"
        ;;
    
    "rebuild")
        print_status "Rebuilding NoteVault application (no cache)..."
        docker compose down app
        docker compose build --no-cache app
        docker compose up -d
        print_success "Rebuild complete!"
        ;;
    
    "logs")
        print_status "Showing logs for all services..."
        docker compose logs -f
        ;;
    
    "logs-app")
        print_status "Showing application logs..."
        docker compose logs -f app
        ;;
    
    "logs-db")
        print_status "Showing database logs..."
        docker compose logs -f postgres
        ;;
    
    "status")
        print_status "Service status:"
        docker compose ps
        ;;
    
    "clean")
        print_warning "This will stop all services and DELETE ALL DATA!"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Cleaning up..."
            docker compose down -v
            print_success "Cleanup complete!"
        else
            print_status "Cleanup cancelled."
        fi
        ;;
    
    "reset")
        print_warning "This will completely reset everything and DELETE ALL DATA!"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Resetting everything..."
            docker compose down -v --rmi local
            check_env_file
            docker compose up -d --build
            print_success "Reset complete!"
            print_status "Access your application at: http://localhost:12000"
        else
            print_status "Reset cancelled."
        fi
        ;;
    
    "db")
        print_status "Connecting to PostgreSQL database..."
        docker compose exec postgres psql -U postgres -d notevault
        ;;
    
    "help"|*)
        show_help
        ;;
esac