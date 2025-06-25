#!/bin/bash

# ITS-Projekt Automatic Update Script
# This script updates the project automatically by pulling the latest changes
# and restarting the application

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_USER="notizprojekt"
PROJECT_NAME="ITS-Projekt"
SERVICE_NAME="notizprojekt"
BACKUP_DIR="/opt/notizprojekt/backups"
LOG_FILE="$PROJECT_DIR/update.log"
JAR_FILE="$PROJECT_DIR/target/notizprojekt-web-*.jar"
JAVA_OPTS="-Xmx1g -Xms512m -XX:+UseG1GC"

# Functions
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${CYAN}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

# Detect if running in production (systemd service) or development mode
detect_mode() {
    if systemctl is-active --quiet "$SERVICE_NAME" 2>/dev/null; then
        PRODUCTION_MODE=true
        info "Running in production mode (systemd service detected)"
    else
        PRODUCTION_MODE=false
        info "Running in development mode"
    fi
}

# Check if running as root
check_permissions() {
    if [[ $EUID -eq 0 ]]; then
        warning "Running as root. Consider using a dedicated user for the application."
    fi
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if git is installed
    if ! command -v git &> /dev/null; then
        error "Git is not installed. Please install git first."
        exit 1
    fi
    
    # Check if Java is installed
    if ! command -v java &> /dev/null; then
        error "Java is not installed. Please install Java 11 or higher."
        exit 1
    fi
    
    # Check if Maven is installed
    if ! command -v mvn &> /dev/null; then
        error "Maven is not installed. Please install Maven first."
        exit 1
    fi
    
    success "All prerequisites are met."
}

# Create backup
create_backup() {
    log "Creating backup..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Create backup with timestamp
    BACKUP_NAME="backup_$(date '+%Y%m%d_%H%M%S')"
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
    
    # Backup current JAR file if it exists
    if [[ -f "$JAR_FILE" ]]; then
        mkdir -p "$BACKUP_PATH"
        cp "$JAR_FILE" "$BACKUP_PATH/"
        success "Backup created at $BACKUP_PATH"
    else
        warning "No existing JAR file to backup."
    fi
    
    # Keep only last 5 backups
    cd "$BACKUP_DIR"
    ls -t | tail -n +6 | xargs -r rm -rf
}

# Stop application
stop_application() {
    log "Stopping application..."
    
    if [[ "$PRODUCTION_MODE" == "true" ]]; then
        # Production mode: use systemd
        if systemctl is-active --quiet "$SERVICE_NAME"; then
            log "Stopping systemd service: $SERVICE_NAME"
            systemctl stop "$SERVICE_NAME"
            success "Application stopped via systemd"
        else
            info "Service is already stopped"
        fi
    else
        # Development mode: use PID file
        PID_FILE="$PROJECT_DIR/app.pid"
        if [[ -f "$PID_FILE" ]]; then
            PID=$(cat "$PID_FILE")
            if ps -p "$PID" > /dev/null 2>&1; then
                log "Stopping application with PID $PID..."
                kill "$PID"
                
                # Wait for graceful shutdown
                for i in {1..30}; do
                    if ! ps -p "$PID" > /dev/null 2>&1; then
                        success "Application stopped gracefully."
                        rm -f "$PID_FILE"
                        return 0
                    fi
                    sleep 1
                done
                
                # Force kill if still running
                warning "Forcing application shutdown..."
                kill -9 "$PID" 2>/dev/null || true
                rm -f "$PID_FILE"
            else
                warning "PID file exists but process is not running."
                rm -f "$PID_FILE"
            fi
        else
            log "No PID file found. Application may not be running."
        fi
        
        # Kill any remaining Java processes for this project
        pkill -f "notizprojekt" || true
    fi
}

# Update source code
update_source() {
    log "Updating source code..."
    
    cd "$PROJECT_DIR"
    
    # Stash any local changes
    if ! git diff --quiet; then
        warning "Local changes detected. Stashing them..."
        git stash push -m "Auto-stash before update $(date)"
    fi
    
    # Fetch latest changes
    git fetch origin
    
    # Get current branch
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    log "Current branch: $CURRENT_BRANCH"
    
    # Pull latest changes
    if git pull origin "$CURRENT_BRANCH"; then
        success "Source code updated successfully."
    else
        error "Failed to update source code."
        exit 1
    fi
}

# Build application
build_application() {
    log "Building application..."
    
    cd "$PROJECT_DIR"
    
    # Ensure we're on the correct branch
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    if [[ "$CURRENT_BRANCH" != "html" ]]; then
        log "Switching to html branch..."
        git checkout html
    fi
    
    # Set JAVA_HOME if needed
    if [[ -z "$JAVA_HOME" ]]; then
        export JAVA_HOME=$(readlink -f /usr/bin/java | sed "s:bin/java::")
        info "Set JAVA_HOME to: $JAVA_HOME"
    fi
    
    # Clean and build with production profile
    if mvn clean package -DskipTests -Pprod; then
        success "Application built successfully."
        
        # Find the built JAR file
        BUILT_JAR=$(find target -name "*.jar" -not -name "*sources*" -not -name "*javadoc*" | head -n 1)
        if [[ -n "$BUILT_JAR" ]]; then
            info "Built JAR: $BUILT_JAR"
        else
            error "No JAR file found after build"
            exit 1
        fi
    else
        error "Failed to build application."
        exit 1
    fi
}

# Start application
start_application() {
    log "Starting application..."
    
    if [[ "$PRODUCTION_MODE" == "true" ]]; then
        # Production mode: use systemd
        log "Starting systemd service: $SERVICE_NAME"
        systemctl start "$SERVICE_NAME"
        
        # Wait for service to be active
        for i in {1..30}; do
            if systemctl is-active --quiet "$SERVICE_NAME"; then
                success "Application started via systemd"
                return 0
            fi
            log "Waiting for service to start... ($i/30)"
            sleep 2
        done
        
        error "Failed to start application via systemd"
        systemctl status "$SERVICE_NAME" || true
        exit 1
    else
        # Development mode: start manually
        cd "$PROJECT_DIR"
        
        # Find JAR file
        ACTUAL_JAR=$(find target -name "*.jar" -not -name "*sources*" -not -name "*javadoc*" | head -n 1)
        if [[ ! -f "$ACTUAL_JAR" ]]; then
            error "JAR file not found in target directory"
            exit 1
        fi
        
        PID_FILE="$PROJECT_DIR/app.pid"
        
        # Start application in background
        nohup java $JAVA_OPTS -jar "$ACTUAL_JAR" --spring.profiles.active=prod > "$PROJECT_DIR/app.log" 2>&1 &
        APP_PID=$!
        
        # Save PID
        echo "$APP_PID" > "$PID_FILE"
        
        # Wait a moment and check if application started successfully
        sleep 5
        if ps -p "$APP_PID" > /dev/null 2>&1; then
            success "Application started successfully with PID $APP_PID"
            log "Application logs: $PROJECT_DIR/app.log"
            log "Application should be available at: http://localhost:12000"
        else
            error "Failed to start application. Check logs for details."
            exit 1
        fi
    fi
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Wait for application to be ready
    for i in {1..30}; do
        if curl -s -f http://localhost:12000/login > /dev/null 2>&1; then
            success "Application is healthy and responding."
            return 0
        fi
        log "Waiting for application to be ready... ($i/30)"
        sleep 2
    done
    
    warning "Health check failed. Application may not be fully ready yet."
    if [[ "$PRODUCTION_MODE" == "true" ]]; then
        log "Check systemd logs: sudo journalctl -u $SERVICE_NAME -f"
    else
        log "Check application logs: $PROJECT_DIR/app.log"
    fi
}

# Cleanup old logs
cleanup_logs() {
    log "Cleaning up old logs..."
    
    # Keep only last 10MB of update log
    if [[ -f "$LOG_FILE" ]]; then
        tail -c 10485760 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
    fi
    
    # Keep only last 50MB of application log
    if [[ -f "$PROJECT_DIR/app.log" ]]; then
        tail -c 52428800 "$PROJECT_DIR/app.log" > "$PROJECT_DIR/app.log.tmp" && mv "$PROJECT_DIR/app.log.tmp" "$PROJECT_DIR/app.log"
    fi
}

# Main update process
main() {
    log "Starting automatic update process..."
    log "Project directory: $PROJECT_DIR"
    
    detect_mode
    check_permissions
    check_prerequisites
    create_backup
    stop_application
    update_source
    build_application
    start_application
    health_check
    cleanup_logs
    
    success "Update completed successfully!"
    log "Update process finished at $(date)"
    echo ""
    echo -e "${GREEN}✓ Update completed successfully!${NC}"
    if [[ "$PRODUCTION_MODE" == "true" ]]; then
        echo -e "${BLUE}ℹ Application is running via systemd service: $SERVICE_NAME${NC}"
        echo -e "${BLUE}ℹ Check logs with: sudo journalctl -u $SERVICE_NAME -f${NC}"
        echo -e "${BLUE}ℹ Service status: sudo systemctl status $SERVICE_NAME${NC}"
    else
        echo -e "${BLUE}ℹ Application is running at: http://localhost:12000${NC}"
        echo -e "${BLUE}ℹ Logs: $PROJECT_DIR/app.log${NC}"
    fi
    echo -e "${BLUE}ℹ Update log: $LOG_FILE${NC}"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "ITS-Projekt Automatic Update Script"
        echo ""
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --stop         Stop the application only"
        echo "  --start        Start the application only"
        echo "  --status       Show application status"
        echo "  --logs         Show application logs"
        echo ""
        echo "Examples:"
        echo "  $0             Run full update process"
        echo "  $0 --stop      Stop the application"
        echo "  $0 --start     Start the application"
        echo "  $0 --status    Check if application is running"
        echo "  $0 --logs      View recent application logs"
        exit 0
        ;;
    --stop)
        detect_mode
        log "Stopping application..."
        stop_application
        success "Application stopped."
        exit 0
        ;;
    --start)
        detect_mode
        log "Starting application..."
        start_application
        success "Application started."
        exit 0
        ;;
    --status)
        detect_mode
        if [[ "$PRODUCTION_MODE" == "true" ]]; then
            if systemctl is-active --quiet "$SERVICE_NAME"; then
                echo -e "${GREEN}✓ Application is running (systemd service: $SERVICE_NAME)${NC}"
                systemctl status "$SERVICE_NAME" --no-pager -l
                exit 0
            else
                echo -e "${RED}✗ Application is not running${NC}"
                systemctl status "$SERVICE_NAME" --no-pager -l || true
                exit 1
            fi
        else
            PID_FILE="$PROJECT_DIR/app.pid"
            if [[ -f "$PID_FILE" ]]; then
                PID=$(cat "$PID_FILE")
                if ps -p "$PID" > /dev/null 2>&1; then
                    echo -e "${GREEN}✓ Application is running (PID: $PID)${NC}"
                    exit 0
                else
                    echo -e "${RED}✗ Application is not running (stale PID file)${NC}"
                    exit 1
                fi
            else
                echo -e "${RED}✗ Application is not running${NC}"
                exit 1
            fi
        fi
        ;;
    --logs)
        detect_mode
        if [[ "$PRODUCTION_MODE" == "true" ]]; then
            echo "Following systemd logs for $SERVICE_NAME..."
            journalctl -u "$SERVICE_NAME" -f
        else
            if [[ -f "$PROJECT_DIR/app.log" ]]; then
                tail -f "$PROJECT_DIR/app.log"
            else
                error "Application log file not found: $PROJECT_DIR/app.log"
                exit 1
            fi
        fi
        ;;
    "")
        # Run main update process
        main
        ;;
    *)
        error "Unknown option: $1"
        echo "Use --help for usage information."
        exit 1
        ;;
esac