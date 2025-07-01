#!/bin/bash

# Set up test environment
PROJECT_DIR="/opt/notizprojekt"
PROJECT_NAME="notizprojekt"
BACKUP_DIR="$PROJECT_DIR/backups"

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

# Create a backup
echo "Creating backup..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.tar.gz"

# Store current directory
BACKUP_CURRENT_DIR=$(pwd)
echo "Current directory before backup: $BACKUP_CURRENT_DIR"

# Backup application
cd "$PROJECT_DIR" || {
    echo "Cannot change to project directory for backup: $PROJECT_DIR"
    exit 1
}

tar -czf "$BACKUP_FILE" \
    --exclude="$PROJECT_NAME/.git" \
    --exclude="$PROJECT_NAME/target" \
    --exclude="logs" \
    "$PROJECT_NAME" 2>/dev/null || true

# Return to original directory
cd "$BACKUP_CURRENT_DIR" || {
    echo "Cannot return to original directory after backup"
    exit 1
}

echo "Current directory after backup: $(pwd)"
echo "Backup created: $BACKUP_FILE"

# Check if we're still in the project directory
if [[ "$(pwd)" == "$PROJECT_DIR/$PROJECT_NAME" ]]; then
    echo "SUCCESS: Still in the project directory after backup"
else
    echo "ERROR: Not in the project directory after backup"
    echo "Current directory: $(pwd)"
    echo "Expected directory: $PROJECT_DIR/$PROJECT_NAME"
fi

# Check if pom.xml is accessible
if [[ -f "pom.xml" ]]; then
    echo "SUCCESS: pom.xml is accessible"
else
    echo "ERROR: pom.xml is not accessible"
fi

# Try to run Maven
echo "Running Maven..."
mvn -v

# Clean up
rm -rf "$PROJECT_DIR"

echo "Test completed"