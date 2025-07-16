# 🚀 NoteVault Deployment Guide

This guide covers deploying NoteVault with all advanced features including WebSocket support, AI insights, and PWA functionality.

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 15+
- Redis (optional, for enhanced caching)
- SSL certificate (for PWA and WebSocket in production)

## 🔧 Environment Configuration

### Required Environment Variables

```bash
# Database
DATABASE_URL="postgresql://username:password@host:5432/notevault?schema=public"

# NextAuth.js
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# App Configuration
APP_NAME="NoteVault"
APP_URL="https://your-domain.com"

# File Upload
UPLOAD_MAX_SIZE="10485760" # 10MB in bytes
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,image/webp,application/pdf"

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Redis (optional)
REDIS_URL="redis://localhost:6379"

# AI Features (optional - for external AI)
OPENAI_API_KEY="your-openai-key"
ANTHROPIC_API_KEY="your-anthropic-key"

# Analytics (optional)
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
```

## 🐳 Docker Deployment (Recommended)

### 1. Update docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "12000:12000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/notevault?schema=public
      - NEXTAUTH_URL=https://your-domain.com
      - NEXTAUTH_SECRET=your-super-secret-key
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: notevault
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### 2. Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Expose port
EXPOSE 12000

# Start application
CMD ["npm", "start"]
```

### 3. Create nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:12000;
    }

    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # WebSocket support
        location /api/socket/ {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Regular HTTP requests
        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # PWA files
        location /manifest.json {
            proxy_pass http://app;
            add_header Cache-Control "public, max-age=86400";
        }

        location /sw.js {
            proxy_pass http://app;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
        }
    }
}
```

### 4. Deploy

```bash
# Build and start services
docker-compose up -d --build

# Run database migrations
docker-compose exec app npx prisma db push

# Create admin user (if needed)
docker-compose exec app npm run db:seed
```

## 🌐 Manual Deployment

### 1. Server Setup

```bash
# Clone repository
git clone https://github.com/your-username/notevault.git
cd notevault

# Install dependencies
npm ci

# Generate Prisma client
npx prisma generate

# Build application
npm run build
```

### 2. Database Setup

```bash
# Run migrations
npx prisma db push

# Seed database (optional)
npm run db:seed
```

### 3. Process Management (PM2)

```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'notevault',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 12000
    }
  }]
}
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🔒 Security Considerations

### 1. Environment Security

```bash
# Set proper file permissions
chmod 600 .env
chown app:app .env

# Use secrets management in production
# - AWS Secrets Manager
# - HashiCorp Vault
# - Kubernetes Secrets
```

### 2. Database Security

```sql
-- Create dedicated database user
CREATE USER notevault_app WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE notevault TO notevault_app;
GRANT USAGE ON SCHEMA public TO notevault_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO notevault_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO notevault_app;
```

### 3. SSL/TLS Configuration

```bash
# Generate SSL certificate (Let's Encrypt)
certbot certonly --webroot -w /var/www/html -d your-domain.com

# Or use existing certificates
cp your-cert.pem /path/to/ssl/cert.pem
cp your-key.pem /path/to/ssl/key.pem
```

## 📊 Monitoring & Logging

### 1. Application Monitoring

```javascript
// Add to your monitoring setup
const monitoring = {
  // WebSocket connections
  websocket_connections: () => wsServer?.getConnectedUsers().length || 0,
  
  // Active workspaces
  active_workspaces: () => wsServer?.getWorkspaceUsers().size || 0,
  
  // Database connections
  db_connections: () => prisma.$metrics.histogram.prisma_client_queries_total,
  
  // Memory usage
  memory_usage: () => process.memoryUsage(),
  
  // CPU usage
  cpu_usage: () => process.cpuUsage()
};
```

### 2. Log Configuration

```javascript
// Add structured logging
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console()
  ]
});
```

## 🚀 Performance Optimization

### 1. Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX CONCURRENTLY idx_notes_workspace_id ON notes(workspace_id) WHERE is_deleted = false;
CREATE INDEX CONCURRENTLY idx_notes_author_id ON notes(author_id);
CREATE INDEX CONCURRENTLY idx_activities_workspace_id ON activities(workspace_id);
CREATE INDEX CONCURRENTLY idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX CONCURRENTLY idx_chat_messages_workspace_id ON chat_messages(workspace_id);
CREATE INDEX CONCURRENTLY idx_note_connections_from_id ON note_connections(from_id);
CREATE INDEX CONCURRENTLY idx_note_connections_to_id ON note_connections(to_id);
```

### 2. Caching Strategy

```javascript
// Redis caching for frequently accessed data
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

// Cache workspace data
const cacheWorkspace = async (workspaceId, data) => {
  await client.setex(`workspace:${workspaceId}`, 300, JSON.stringify(data));
};

// Cache user sessions
const cacheUserSession = async (userId, sessionData) => {
  await client.setex(`session:${userId}`, 3600, JSON.stringify(sessionData));
};
```

### 3. CDN Configuration

```javascript
// Configure CDN for static assets
const cdnConfig = {
  images: 'https://cdn.your-domain.com/images/',
  assets: 'https://cdn.your-domain.com/assets/',
  uploads: 'https://cdn.your-domain.com/uploads/'
};
```

## 🔄 Backup & Recovery

### 1. Automated Backups

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Database backup
pg_dump $DATABASE_URL > "$BACKUP_DIR/db_backup_$DATE.sql"

# File uploads backup
tar -czf "$BACKUP_DIR/uploads_backup_$DATE.tar.gz" uploads/

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

# Upload to cloud storage (optional)
aws s3 cp "$BACKUP_DIR/db_backup_$DATE.sql" s3://your-backup-bucket/
```

### 2. Recovery Procedures

```bash
# Database recovery
psql $DATABASE_URL < /backups/db_backup_YYYYMMDD_HHMMSS.sql

# Files recovery
tar -xzf /backups/uploads_backup_YYYYMMDD_HHMMSS.tar.gz

# Restart services
docker-compose restart
# or
pm2 restart notevault
```

## 📱 PWA Deployment Notes

### 1. HTTPS Requirement

PWA features require HTTPS in production. Ensure SSL is properly configured.

### 2. Service Worker Updates

```javascript
// Handle service worker updates
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(registration => {
    registration.addEventListener('updatefound', () => {
      // Notify user of available update
      showUpdateNotification();
    });
  });
}
```

### 3. App Store Deployment

For mobile app stores, consider using:
- **PWA Builder** for Microsoft Store
- **Bubblewrap** for Google Play Store
- **PWA to APK** converters

## 🧪 Testing in Production

### 1. Health Checks

```javascript
// Add health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      websocket: wsServer ? 'connected' : 'disconnected'
    }
  };
  
  res.json(health);
});
```

### 2. Load Testing

```bash
# Install artillery for load testing
npm install -g artillery

# Create load test config
cat > load-test.yml << EOF
config:
  target: 'https://your-domain.com'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Browse workspaces"
    flow:
      - get:
          url: "/"
      - get:
          url: "/api/workspaces"
EOF

# Run load test
artillery run load-test.yml
```

## 🎯 Go-Live Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] WebSocket proxy configured
- [ ] File upload directories created
- [ ] Backup system configured
- [ ] Monitoring setup complete
- [ ] Health checks working
- [ ] Load testing passed
- [ ] PWA manifest accessible
- [ ] Service worker functioning
- [ ] Admin user created
- [ ] DNS records configured
- [ ] CDN configured (if applicable)
- [ ] Error tracking setup (Sentry, etc.)

## 🆘 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check proxy configuration
   - Verify SSL certificates
   - Ensure port 12000 is accessible

2. **Database Connection Issues**
   - Verify DATABASE_URL format
   - Check network connectivity
   - Ensure database exists

3. **PWA Not Installing**
   - Verify HTTPS is working
   - Check manifest.json accessibility
   - Ensure service worker is registered

4. **File Upload Issues**
   - Check upload directory permissions
   - Verify UPLOAD_MAX_SIZE setting
   - Ensure disk space available

### Support

For deployment issues:
1. Check application logs
2. Verify environment configuration
3. Test individual components
4. Consult the troubleshooting guide
5. Open an issue on GitHub

---

**Ready for production!** 🚀 Your NoteVault deployment should now be fully functional with all advanced features.