#!/bin/bash

# NoteVault Unified Setup Script
# This script handles installation, updates, and management of NoteVault
#
# Usage:
#   sudo ./setup.sh                    # Interactive menu
#   sudo ./setup.sh install            # Direct install
#   sudo ./setup.sh update             # Direct update
#   sudo ./setup.sh status             # Check status
#   sudo ./setup.sh start              # Start application
#   sudo ./setup.sh stop               # Stop application
#   sudo ./setup.sh logs               # View logs
#   sudo ./setup.sh backup             # Create backup
#
# One-liner installation:
#   curl -fsSL https://raw.githubusercontent.com/PythonTilk/Notes/main/setup.sh | sudo bash -s install
#   OR
#   sudo bash -c "$(curl -fsSL https://raw.githubusercontent.com/PythonTilk/Notes/main/setup.sh)" install
#
# Environment Variables (for automated install):
#   DOMAIN="your-domain.com"        # Domain name
#   EMAIL="admin@domain.com"        # Email for SSL certificates
#   DB_PASSWORD="password"          # Database password
#   SKIP_PROMPTS="true"            # Skip interactive prompts

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
PROJECT_NAME="NoteVault"
PROJECT_USER="notizprojekt"
PROJECT_DIR="/opt/notizprojekt"
REPO_URL="https://github.com/PythonTilk/Notes.git"
DB_NAME="notizprojekt"
DB_USER="notizprojekt"
SERVICE_NAME="notizprojekt"
BACKUP_DIR="/opt/notizprojekt/backups"
LOG_FILE="/opt/notizprojekt/logs/setup.log"
JAVA_OPTS="-Xmx1g -Xms512m -XX:+UseG1GC"

# Environment variables
DOMAIN="${DOMAIN:-}"
EMAIL="${EMAIL:-}"
DB_PASSWORD="${DB_PASSWORD:-}"
SKIP_PROMPTS="${SKIP_PROMPTS:-false}"

# Functions
print_header() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                          NoteVault Setup & Management                       ║"
    echo "║                     Installation, Updates & Administration                  ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
    
    # Ensure log directory exists
    if [[ ! -d "$(dirname "$LOG_FILE")" ]]; then
        mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null || true
        if [[ -d "$(dirname "$LOG_FILE")" ]]; then
            # Set permissions if directory was created
            if [[ -n "$PROJECT_USER" ]]; then
                chown -R "$PROJECT_USER:$PROJECT_USER" "$(dirname "$LOG_FILE")" 2>/dev/null || true
            fi
        fi
    fi
    
    # Append to log file if it exists or can be created
    if [[ -f "$LOG_FILE" ]]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE" 2>/dev/null || true
    elif touch "$LOG_FILE" 2>/dev/null; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE" 2>/dev/null || true
        if [[ -n "$PROJECT_USER" ]]; then
            chown "$PROJECT_USER:$PROJECT_USER" "$LOG_FILE" 2>/dev/null || true
        fi
    fi
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    if [[ -f "$LOG_FILE" ]]; then
        echo "[ERROR] $1" >> "$LOG_FILE"
    fi
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    if [[ -f "$LOG_FILE" ]]; then
        echo "[SUCCESS] $1" >> "$LOG_FILE"
    fi
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    if [[ -f "$LOG_FILE" ]]; then
        echo "[WARNING] $1" >> "$LOG_FILE"
    fi
}

info() {
    echo -e "${CYAN}[INFO]${NC} $1"
    if [[ -f "$LOG_FILE" ]]; then
        echo "[INFO] $1" >> "$LOG_FILE"
    fi
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root (use sudo)"
        exit 1
    fi
}

# Detect OS
detect_os() {
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    else
        error "Cannot detect OS. This script supports Ubuntu 20.04+ and Debian 11+"
        exit 1
    fi

    if [[ "$OS" != *"Ubuntu"* ]] && [[ "$OS" != *"Debian"* ]]; then
        error "Unsupported OS: $OS. This script supports Ubuntu 20.04+ and Debian 11+"
        exit 1
    fi

    info "Detected OS: $OS $VER"
}

# Check if application is installed
is_installed() {
    [[ -d "$PROJECT_DIR" ]] && [[ -f "/etc/systemd/system/$SERVICE_NAME.service" ]]
}

# Check if application is running
is_running() {
    systemctl is-active --quiet "$SERVICE_NAME" 2>/dev/null
}

# Get application status
get_status() {
    if ! is_installed; then
        echo "not_installed"
    elif is_running; then
        echo "running"
    else
        echo "stopped"
    fi
}

# Install system dependencies
install_dependencies() {
    log "Installing system dependencies..."
    
    # Update package list
    apt update
    
    # Install Java 17
    if ! command -v java &> /dev/null; then
        log "Installing Java 17..."
        apt install -y openjdk-17-jdk
    else
        info "Java already installed: $(java -version 2>&1 | head -n 1)"
    fi
    
    # Install Maven
    if ! command -v mvn &> /dev/null; then
        log "Installing Maven..."
        apt install -y maven
    else
        info "Maven already installed: $(mvn -version | head -n 1)"
    fi
    
    # Install MySQL
    if ! command -v mysql &> /dev/null; then
        log "Installing MySQL..."
        apt install -y mysql-server
        systemctl start mysql
        systemctl enable mysql
    else
        info "MySQL already installed"
    fi
    
    # Install Nginx
    if ! command -v nginx &> /dev/null; then
        log "Installing Nginx..."
        apt install -y nginx
        systemctl start nginx
        systemctl enable nginx
    else
        info "Nginx already installed"
    fi
    
    # Install Certbot
    if ! command -v certbot &> /dev/null; then
        log "Installing Certbot..."
        apt install -y certbot python3-certbot-nginx
    else
        info "Certbot already installed"
    fi
    
    # Install other utilities
    apt install -y git curl wget unzip ufw
    
    success "System dependencies installed successfully"
}

# Create project user
create_user() {
    if ! id "$PROJECT_USER" &>/dev/null; then
        log "Creating project user: $PROJECT_USER"
        useradd -r -m -d "$PROJECT_DIR" -s /bin/bash "$PROJECT_USER"
        success "User $PROJECT_USER created"
    else
        info "User $PROJECT_USER already exists"
    fi
    
    # Ensure project directory exists with correct permissions
    if [[ ! -d "$PROJECT_DIR" ]]; then
        log "Creating project directory: $PROJECT_DIR"
        mkdir -p "$PROJECT_DIR"
    fi
    
    # Set correct ownership
    chown -R "$PROJECT_USER:$PROJECT_USER" "$PROJECT_DIR"
    chmod 755 "$PROJECT_DIR"
}

# Setup database
setup_database() {
    log "Setting up database..."
    
    # Generate random password if not provided
    if [[ -z "$DB_PASSWORD" ]]; then
        DB_PASSWORD=$(openssl rand -base64 32)
        info "Generated database password: $DB_PASSWORD"
    fi
    
    # Create database and user
    mysql -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;"
    mysql -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';"
    mysql -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';"
    mysql -e "FLUSH PRIVILEGES;"
    
    # Import schema if it exists
    if [[ -f "$PROJECT_DIR/$PROJECT_NAME/notevault-schema.sql" ]]; then
        log "Importing database schema..."
        mysql < "$PROJECT_DIR/$PROJECT_NAME/notevault-schema.sql"
    fi
    
    success "Database setup completed"
}

# Clone or update repository
setup_repository() {
    log "Setting up repository..."
    
    # Ensure project directory exists with correct permissions
    if [[ ! -d "$PROJECT_DIR" ]]; then
        log "Creating project directory: $PROJECT_DIR"
        mkdir -p "$PROJECT_DIR"
        chown -R "$PROJECT_USER:$PROJECT_USER" "$PROJECT_DIR"
        chmod 755 "$PROJECT_DIR"
    fi
    
    if [[ ! -d "$PROJECT_DIR/$PROJECT_NAME" ]]; then
        log "Cloning repository..."
        # Try with sudo -u first
        if ! sudo -u "$PROJECT_USER" git clone "$REPO_URL" "$PROJECT_DIR/$PROJECT_NAME" 2>/dev/null; then
            # If that fails, try direct clone and fix permissions after
            log "Retrying clone with different method..."
            git clone "$REPO_URL" "$PROJECT_DIR/$PROJECT_NAME"
            chown -R "$PROJECT_USER:$PROJECT_USER" "$PROJECT_DIR/$PROJECT_NAME"
        fi
    else
        log "Updating repository..."
        cd "$PROJECT_DIR/$PROJECT_NAME"
        # Try with sudo -u first
        if ! sudo -u "$PROJECT_USER" git fetch origin 2>/dev/null; then
            # If that fails, try direct git commands and fix permissions after
            git fetch origin
            git reset --hard origin/main
            chown -R "$PROJECT_USER:$PROJECT_USER" "$PROJECT_DIR/$PROJECT_NAME"
        else
            sudo -u "$PROJECT_USER" git reset --hard origin/main
        fi
    fi
    
    success "Repository setup completed"
}

# Build application
build_application() {
    log "Building application..."
    
    cd "$PROJECT_DIR/$PROJECT_NAME"
    
    # Create backup if updating
    if [[ -f "target/notizprojekt-web-0.0.1-SNAPSHOT.jar" ]]; then
        create_backup
    fi
    
    # Ensure mvnw is executable
    chmod +x ./mvnw 2>/dev/null || true
    
    # Build with Maven - try multiple methods
    if [[ -f "./mvnw" ]]; then
        log "Building with Maven wrapper..."
        sudo -u "$PROJECT_USER" ./mvnw clean package -DskipTests || {
            log "Maven wrapper failed, trying with system Maven..."
            if command -v mvn &> /dev/null; then
                sudo -u "$PROJECT_USER" mvn clean package -DskipTests
            else
                error "Both Maven wrapper and system Maven failed"
                exit 1
            fi
        }
    else
        log "Maven wrapper not found, trying with system Maven..."
        if command -v mvn &> /dev/null; then
            sudo -u "$PROJECT_USER" mvn clean package -DskipTests
        else
            error "Maven not found. Please install Maven or fix the Maven wrapper"
            exit 1
        fi
    fi
    
    # Verify JAR file was created
    if [[ ! -f "target/notizprojekt-web-0.0.1-SNAPSHOT.jar" ]]; then
        error "Build failed - JAR file not found"
        exit 1
    fi
    
    success "Application built successfully"
}

# Setup application configuration
setup_configuration() {
    log "Setting up application configuration..."
    
    # Create logs directory
    mkdir -p "$PROJECT_DIR/logs"
    chown "$PROJECT_USER:$PROJECT_USER" "$PROJECT_DIR/logs"
    
    # Create uploads directory
    mkdir -p "$PROJECT_DIR/$PROJECT_NAME/uploads"
    chown -R "$PROJECT_USER:$PROJECT_USER" "$PROJECT_DIR/$PROJECT_NAME/uploads"
    
    # Create environment file
    cat > "$PROJECT_DIR/.env" << EOF
# ITS-Projekt Configuration
DOMAIN=$DOMAIN
EMAIL=$EMAIL
DB_PASSWORD=$DB_PASSWORD
JAVA_OPTS=$JAVA_OPTS
EOF
    
    chown "$PROJECT_USER:$PROJECT_USER" "$PROJECT_DIR/.env"
    chmod 600 "$PROJECT_DIR/.env"
    
    success "Configuration setup completed"
}

# Setup systemd service
setup_service() {
    log "Setting up systemd service..."
    
    # Find JAR file with absolute path
    JAR_PATH=$(find "$PROJECT_DIR/$PROJECT_NAME/target" -name "notizprojekt-web-*.jar" | head -1)
    
    if [[ -z "$JAR_PATH" ]]; then
        error "JAR file not found in target directory"
        exit 1
    fi
    
    cat > "/etc/systemd/system/$SERVICE_NAME.service" << EOF
[Unit]
Description=NoteVault Note Management System
After=network.target mysql.service

[Service]
Type=simple
User=$PROJECT_USER
Group=$PROJECT_USER
WorkingDirectory=$PROJECT_DIR/$PROJECT_NAME
ExecStart=/usr/bin/java $JAVA_OPTS -jar $JAR_PATH
Restart=always
RestartSec=10
StandardOutput=append:$PROJECT_DIR/logs/application.log
StandardError=append:$PROJECT_DIR/logs/application.log
Environment=SPRING_PROFILES_ACTIVE=production

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable "$SERVICE_NAME"
    
    success "Systemd service setup completed"
}

# Setup Nginx reverse proxy
setup_nginx() {
    if [[ -z "$DOMAIN" ]]; then
        warning "No domain provided, skipping Nginx setup"
        return
    fi
    
    log "Setting up Nginx reverse proxy for $DOMAIN..."
    
    cat > "/etc/nginx/sites-available/$SERVICE_NAME" << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    location / {
        proxy_pass http://localhost:12000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # File upload size
    client_max_body_size 25M;
}
EOF
    
    # Enable site
    ln -sf "/etc/nginx/sites-available/$SERVICE_NAME" "/etc/nginx/sites-enabled/"
    rm -f /etc/nginx/sites-enabled/default
    
    # Test configuration
    nginx -t
    systemctl reload nginx
    
    success "Nginx setup completed"
}

# Setup SSL certificate
setup_ssl() {
    if [[ -z "$DOMAIN" ]] || [[ -z "$EMAIL" ]]; then
        warning "Domain or email not provided, skipping SSL setup"
        return
    fi
    
    log "Setting up SSL certificate for $DOMAIN..."
    
    # Get certificate
    certbot --nginx -d "$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive --redirect
    
    # Setup auto-renewal
    systemctl enable certbot.timer
    
    success "SSL certificate setup completed"
}

# Setup firewall
setup_firewall() {
    log "Setting up firewall..."
    
    # Reset UFW
    ufw --force reset
    
    # Default policies
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH, HTTP, HTTPS
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Enable firewall
    ufw --force enable
    
    success "Firewall setup completed"
}

# Create backup
create_backup() {
    log "Creating backup..."
    
    mkdir -p "$BACKUP_DIR"
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.tar.gz"
    
    # Backup application and database
    cd "$PROJECT_DIR"
    tar -czf "$BACKUP_FILE" \
        --exclude="$PROJECT_NAME/.git" \
        --exclude="$PROJECT_NAME/target" \
        --exclude="logs" \
        "$PROJECT_NAME" .env 2>/dev/null || true
    
    # Backup database
    if command -v mysqldump &> /dev/null; then
        mysqldump -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql" 2>/dev/null || true
    fi
    
    chown -R "$PROJECT_USER:$PROJECT_USER" "$BACKUP_DIR"
    
    # Keep only last 10 backups
    cd "$BACKUP_DIR"
    ls -t backup_*.tar.gz 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
    ls -t db_backup_*.sql 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
    
    success "Backup created: $BACKUP_FILE"
}

# Get user input
get_input() {
    if [[ "$SKIP_PROMPTS" == "true" ]]; then
        return
    fi
    
    if [[ -z "$DOMAIN" ]]; then
        read -p "Enter your domain name (e.g., notes.example.com): " DOMAIN
    fi
    
    if [[ -z "$EMAIL" ]]; then
        read -p "Enter your email for SSL certificates: " EMAIL
    fi
    
    if [[ -z "$DB_PASSWORD" ]]; then
        read -s -p "Enter database password (leave empty for auto-generated): " DB_PASSWORD
        echo
    fi
}

# Installation function
install_application() {
    print_header
    log "Starting NoteVault installation..."
    
    detect_os
    get_input
    
    install_dependencies
    create_user
    setup_repository
    build_application
    setup_database
    setup_configuration
    setup_service
    setup_nginx
    setup_ssl
    setup_firewall
    
    # Start application
    systemctl start "$SERVICE_NAME"
    
    success "Installation completed successfully!"
    echo
    echo -e "${GREEN}🎉 NoteVault is now running!${NC}"
    echo -e "${CYAN}📱 Access your application at: https://$DOMAIN${NC}"
    echo -e "${YELLOW}📋 Default test account: testuser123 / password123${NC}"
    echo
    echo -e "${BLUE}Management commands:${NC}"
    echo -e "  sudo $0 status    # Check application status"
    echo -e "  sudo $0 logs      # View application logs"
    echo -e "  sudo $0 update    # Update application"
    echo -e "  sudo $0 backup    # Create backup"
}

# Update function
update_application() {
    if ! is_installed; then
        error "Application is not installed. Run 'install' first."
        exit 1
    fi
    
    log "Starting application update..."
    
    # Stop application
    if is_running; then
        log "Stopping application..."
        systemctl stop "$SERVICE_NAME"
    fi
    
    # Update repository and rebuild
    setup_repository
    build_application
    
    # Update service file with new JAR path
    setup_service
    
    # Start application
    systemctl start "$SERVICE_NAME"
    
    success "Update completed successfully!"
    show_status
}

# Show status
show_status() {
    STATUS=$(get_status)
    
    echo -e "${BLUE}NoteVault Status:${NC}"
    echo "===================="
    
    case $STATUS in
        "not_installed")
            echo -e "Status: ${RED}Not Installed${NC}"
            ;;
        "running")
            echo -e "Status: ${GREEN}Running${NC}"
            if command -v systemctl &> /dev/null; then
                echo "Service: $(systemctl is-active $SERVICE_NAME)"
                echo "Uptime: $(systemctl show $SERVICE_NAME --property=ActiveEnterTimestamp --value)"
            fi
            ;;
        "stopped")
            echo -e "Status: ${YELLOW}Stopped${NC}"
            ;;
    esac
    
    if is_installed; then
        echo "Install Directory: $PROJECT_DIR"
        echo "Service: $SERVICE_NAME"
        
        if [[ -f "$PROJECT_DIR/.env" ]]; then
            source "$PROJECT_DIR/.env"
            if [[ -n "$DOMAIN" ]]; then
                echo "Domain: $DOMAIN"
            fi
        fi
        
        # Show recent logs
        if [[ -f "$PROJECT_DIR/logs/application.log" ]]; then
            echo
            echo -e "${BLUE}Recent Logs:${NC}"
            tail -5 "$PROJECT_DIR/logs/application.log" 2>/dev/null || echo "No logs available"
        fi
    fi
}

# Start application
start_application() {
    if ! is_installed; then
        error "Application is not installed"
        exit 1
    fi
    
    log "Starting application..."
    systemctl start "$SERVICE_NAME"
    success "Application started"
}

# Stop application
stop_application() {
    if ! is_installed; then
        error "Application is not installed"
        exit 1
    fi
    
    log "Stopping application..."
    systemctl stop "$SERVICE_NAME"
    success "Application stopped"
}

# Show logs
show_logs() {
    if ! is_installed; then
        error "Application is not installed"
        exit 1
    fi
    
    echo -e "${BLUE}Application Logs:${NC}"
    echo "=================="
    
    if [[ -f "$PROJECT_DIR/logs/application.log" ]]; then
        tail -50 "$PROJECT_DIR/logs/application.log"
    else
        echo "No application logs found"
    fi
    
    echo
    echo -e "${BLUE}Service Logs:${NC}"
    echo "============="
    journalctl -u "$SERVICE_NAME" -n 20 --no-pager
}

# Show menu
show_menu() {
    print_header
    
    STATUS=$(get_status)
    echo -e "${CYAN}Current Status: $STATUS${NC}"
    echo
    
    echo "Select an option:"
    echo "1) Install Application"
    echo "2) Update Application"
    echo "3) Show Status"
    echo "4) Start Application"
    echo "5) Stop Application"
    echo "6) View Logs"
    echo "7) Create Backup"
    echo "8) Exit"
    echo
    
    read -p "Enter your choice (1-8): " choice
    
    case $choice in
        1) install_application ;;
        2) update_application ;;
        3) show_status ;;
        4) start_application ;;
        5) stop_application ;;
        6) show_logs ;;
        7) create_backup ;;
        8) exit 0 ;;
        *) error "Invalid choice. Please select 1-8." ;;
    esac
}

# Main script logic
main() {
    check_root
    
    # Create log directory if it doesn't exist
    mkdir -p "$(dirname "$LOG_FILE")"
    
    case "${1:-}" in
        "install")
            install_application
            ;;
        "update")
            update_application
            ;;
        "status")
            show_status
            ;;
        "start")
            start_application
            ;;
        "stop")
            stop_application
            ;;
        "logs")
            show_logs
            ;;
        "backup")
            create_backup
            ;;
        "")
            show_menu
            ;;
        *)
            echo "Usage: $0 [install|update|status|start|stop|logs|backup]"
            echo
            echo "Commands:"
            echo "  install  - Install the application"
            echo "  update   - Update the application"
            echo "  status   - Show application status"
            echo "  start    - Start the application"
            echo "  stop     - Stop the application"
            echo "  logs     - View application logs"
            echo "  backup   - Create backup"
            echo
            echo "Run without arguments for interactive menu"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"