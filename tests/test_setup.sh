#!/bin/bash

# Extract the functions we need from setup.sh
extract_functions() {
    # Extract the build_application function
    BUILD_APP_FUNC=$(sed -n '/^build_application()/,/^}/p' ./setup.sh)
    
    # Extract the create_backup function
    CREATE_BACKUP_FUNC=$(sed -n '/^create_backup()/,/^}/p' ./setup.sh)
    
    # Extract the helper functions
    LOG_FUNC=$(sed -n '/^log()/,/^}/p' ./setup.sh)
    INFO_FUNC=$(sed -n '/^info()/,/^}/p' ./setup.sh)
    ERROR_FUNC=$(sed -n '/^error()/,/^}/p' ./setup.sh)
    SUCCESS_FUNC=$(sed -n '/^success()/,/^}/p' ./setup.sh)
    
    # Define the functions
    eval "$LOG_FUNC"
    eval "$INFO_FUNC"
    eval "$ERROR_FUNC"
    eval "$SUCCESS_FUNC"
    eval "$CREATE_BACKUP_FUNC"
    eval "$BUILD_APP_FUNC"
}

# Extract the functions
extract_functions

# Set required variables
PROJECT_DIR="/opt/notizprojekt"
PROJECT_NAME="notizprojekt"
BACKUP_DIR="$PROJECT_DIR/backups"
DB_NAME="notizprojekt"
DB_USER="notizprojekt"
DB_PASSWORD="test_password"

# Create test directories
mkdir -p "$PROJECT_DIR/$PROJECT_NAME"
mkdir -p "$BACKUP_DIR"

# Create a dummy pom.xml file
cat > "$PROJECT_DIR/$PROJECT_NAME/pom.xml" << EOF
<project>
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>notizprojekt-web</artifactId>
    <version>0.0.1-SNAPSHOT</version>
</project>
EOF

# Create a dummy target directory and JAR file
mkdir -p "$PROJECT_DIR/$PROJECT_NAME/target"
touch "$PROJECT_DIR/$PROJECT_NAME/target/notizprojekt-web-0.0.1-SNAPSHOT.jar"

# Change to the project directory
cd "$PROJECT_DIR/$PROJECT_NAME"

# Test the build_application function
echo "Testing build_application function..."
build_application

# Check if we're still in the project directory
if [[ "$(pwd)" == "$PROJECT_DIR/$PROJECT_NAME" ]]; then
    echo "SUCCESS: Still in the project directory after build_application"
else
    echo "ERROR: Not in the project directory after build_application"
    echo "Current directory: $(pwd)"
    echo "Expected directory: $PROJECT_DIR/$PROJECT_NAME"
fi

# Check if pom.xml is accessible
if [[ -f "pom.xml" ]]; then
    echo "SUCCESS: pom.xml is accessible"
else
    echo "ERROR: pom.xml is not accessible"
fi

# Clean up
rm -rf "$PROJECT_DIR"

echo "Test completed"