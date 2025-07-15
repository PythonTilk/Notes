# Docker Compose Setup Guide

This guide will help you run NoteVault using Docker Compose, which includes PostgreSQL, Redis, and the application all in containers.

## Prerequisites

- Docker and Docker Compose installed
- At least 2GB of available RAM
- Ports 12000, 5432, and 6379 available

## Quick Start

### 1. Clone and Navigate
```bash
git clone https://github.com/PythonTilk/Notes.git
cd Notes
git checkout modern-rewrite
```

### 2. Environment Setup
```bash
# Copy the example environment file
cp .env.example .env.local

# Edit the environment file (optional - defaults work for Docker Compose)
nano .env.local
```

### 3. Build and Run
```bash
# Build and start all services
docker compose up -d --build

# Or if you encounter build issues, force rebuild
docker compose build --no-cache
docker compose up -d
```

### 4. Access the Application
- Open your browser and go to: http://localhost:12000
- You'll be redirected to the setup page to create your admin account
- Fill in your admin details and click "Create Admin Account"
- Login with your new admin credentials

## Environment Configuration

The docker-compose.yml file includes default environment variables that work out of the box:

```yaml
environment:
  - NODE_ENV=production
  - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/notevault
  - NEXTAUTH_URL=http://localhost:12000
  - NEXTAUTH_SECRET=your-secret-key-here
  - REDIS_URL=redis://redis:6379
```

### For Production
Update these values in your .env.local file:

```env
# Generate a strong secret key
NEXTAUTH_SECRET="your-very-secure-secret-key-here"

# Update URL to your domain
NEXTAUTH_URL="https://your-domain.com"
APP_URL="https://your-domain.com"

# Optional: Add OAuth providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Services Included

### 1. PostgreSQL Database
- **Container**: `notevault-postgres`
- **Port**: 5432
- **Database**: `notevault`
- **Credentials**: postgres/postgres
- **Data**: Persisted in `postgres_data` volume

### 2. Redis Cache
- **Container**: `notevault-redis`
- **Port**: 6379
- **Data**: Persisted in `redis_data` volume
- **Used for**: Session storage and caching

### 3. NoteVault App
- **Container**: `notevault-app`
- **Port**: 12000
- **Built from**: Local Dockerfile
- **Uploads**: Mounted to `./uploads` directory

## Common Commands

### Start Services
```bash
# Start all services in background
docker compose up -d

# Start with logs visible
docker compose up

# Start specific service
docker compose up postgres
```

### Stop Services
```bash
# Stop all services
docker compose down

# Stop and remove volumes (WARNING: deletes data)
docker compose down -v
```

### View Logs
```bash
# All services
docker compose logs

# Specific service
docker compose logs app
docker compose logs postgres

# Follow logs in real-time
docker compose logs -f app
```

### Rebuild Application
```bash
# Rebuild app container
docker compose build app

# Rebuild with no cache (if issues)
docker compose build --no-cache app

# Rebuild and restart
docker compose up -d --build app
```

### Database Operations
```bash
# Access PostgreSQL directly
docker compose exec postgres psql -U postgres -d notevault

# Run Prisma commands
docker compose exec app npx prisma studio
docker compose exec app npx prisma db push
```

## Troubleshooting

### Build Errors
If you encounter "Could not find Prisma Schema" errors:
```bash
# Force rebuild without cache
docker compose build --no-cache
docker compose up -d
```

### Port Conflicts
If ports are already in use:
```bash
# Check what's using the ports
sudo netstat -tulpn | grep :12000
sudo netstat -tulpn | grep :5432

# Stop conflicting services or change ports in docker-compose.yml
```

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker compose ps postgres

# Check PostgreSQL logs
docker compose logs postgres

# Restart PostgreSQL
docker compose restart postgres
```

### Application Not Starting
```bash
# Check application logs
docker compose logs app

# Restart application
docker compose restart app

# Rebuild and restart
docker compose up -d --build app
```

### Reset Everything
```bash
# Stop all services and remove volumes (WARNING: deletes all data)
docker compose down -v

# Remove all containers and images
docker compose down --rmi all -v

# Start fresh
docker compose up -d --build
```

## File Structure

```
Notes/
├── docker-compose.yml          # Docker Compose configuration
├── Dockerfile                  # Application container definition
├── .env.example               # Environment variables template
├── .env.local                 # Your environment variables (create this)
├── .dockerignore              # Files to ignore in Docker build
├── docker-build.sh            # Build script with cache options
├── uploads/                   # File uploads (created automatically)
└── ...
```

## Production Deployment

For production deployment:

1. **Use a reverse proxy** (nginx, Traefik) for HTTPS
2. **Update environment variables** for your domain
3. **Use external database** for better performance and backups
4. **Set up monitoring** and log aggregation
5. **Configure backups** for PostgreSQL data
6. **Use Docker secrets** for sensitive data

Example production docker-compose.yml modifications:
```yaml
services:
  app:
    environment:
      - NODE_ENV=production
      - NEXTAUTH_URL=https://your-domain.com
      - NEXTAUTH_SECRET_FILE=/run/secrets/nextauth_secret
    secrets:
      - nextauth_secret

secrets:
  nextauth_secret:
    external: true
```

## Support

If you encounter issues:
1. Check the logs: `docker compose logs app`
2. Verify environment variables in .env.local
3. Ensure all ports are available
4. Try rebuilding with `--no-cache`
5. Check the main DEPLOYMENT.md for additional troubleshooting