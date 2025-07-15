#!/bin/bash
set -e

echo "🚀 Starting NoteVault application..."

# Function to wait for database to be ready
wait_for_db() {
    echo "⏳ Waiting for database to be ready..."
    
    # Extract database connection details from DATABASE_URL
    # Format: postgresql://user:password@host:port/database
    if [[ $DATABASE_URL =~ postgresql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
        DB_USER="${BASH_REMATCH[1]}"
        DB_PASS="${BASH_REMATCH[2]}"
        DB_HOST="${BASH_REMATCH[3]}"
        DB_PORT="${BASH_REMATCH[4]}"
        DB_NAME="${BASH_REMATCH[5]}"
    else
        echo "❌ Could not parse DATABASE_URL: $DATABASE_URL"
        exit 1
    fi
    
    # Wait for PostgreSQL to be ready
    until PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c '\q' 2>/dev/null; do
        echo "⏳ PostgreSQL is unavailable - sleeping..."
        sleep 2
    done
    
    echo "✅ PostgreSQL is ready!"
}

# Function to run database migrations
run_migrations() {
    echo "🔄 Running database migrations..."
    
    # Check if we can connect to the database
    if ! npx prisma db push --accept-data-loss 2>/dev/null; then
        echo "⚠️  Database push failed, trying to create database first..."
        
        # Try to create the database if it doesn't exist
        if [[ $DATABASE_URL =~ postgresql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
            DB_USER="${BASH_REMATCH[1]}"
            DB_PASS="${BASH_REMATCH[2]}"
            DB_HOST="${BASH_REMATCH[3]}"
            DB_PORT="${BASH_REMATCH[4]}"
            DB_NAME="${BASH_REMATCH[5]}"
            
            # Connect to postgres database to create our database
            PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "postgres" -c "CREATE DATABASE \"$DB_NAME\";" 2>/dev/null || echo "Database might already exist"
        fi
        
        # Try database push again
        npx prisma db push --accept-data-loss
    fi
    
    echo "✅ Database migrations completed!"
}

# Function to generate Prisma client
generate_client() {
    echo "🔧 Generating Prisma client..."
    npx prisma generate
    echo "✅ Prisma client generated!"
}

# Main execution
main() {
    # Wait for database to be ready
    wait_for_db
    
    # Generate Prisma client (in case it's missing)
    generate_client
    
    # Run database migrations
    run_migrations
    
    echo "🎉 Setup complete! Starting application..."
    
    # Start the Next.js application
    exec node server.js
}

# PostgreSQL client should already be installed in the Docker image

# Run main function
main "$@"