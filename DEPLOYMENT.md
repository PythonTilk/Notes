# NoteVault Deployment Guide

## Docker Deployment

### Prerequisites
- Docker and Docker Compose installed
- PostgreSQL database (can be external or via Docker)

### Environment Setup

1. Copy the environment file:
```bash
cp .env.example .env.local
```

2. Update the environment variables in `.env.local`:
```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth
NEXTAUTH_URL="http://localhost:12000"
NEXTAUTH_SECRET="your-secret-key-here"

# App Settings
NODE_ENV="production"
```

### Build and Run

1. Build the Docker image:
```bash
docker build -t notevault .
```

2. Run with Docker Compose:
```bash
docker compose up -d
```

3. Or run manually:
```bash
docker run -d \
  --name notevault \
  -p 12000:12000 \
  --env-file .env.local \
  notevault
```

### Database Setup

The application will automatically:
1. Generate Prisma client on build
2. Check if setup is required on first run
3. Redirect to `/setup` if no admin users exist
4. Create the initial admin account through the setup page

### First-Time Setup

1. Navigate to `http://your-domain:12000`
2. You'll be automatically redirected to `/setup`
3. Fill in the admin account details:
   - Name: Your admin name
   - Email: Admin email address
   - Password: Secure password (min 8 characters)
4. Click "Create Admin Account"
5. You'll be redirected to signin with success message
6. Login with your new admin credentials

### Production Considerations

1. **Database**: Use a managed PostgreSQL service (AWS RDS, Google Cloud SQL, etc.)
2. **Environment**: Set `NODE_ENV=production`
3. **SSL**: Use a reverse proxy (nginx, Cloudflare) for HTTPS
4. **Secrets**: Use strong, unique values for `NEXTAUTH_SECRET`
5. **Monitoring**: Set up logging and monitoring for the container

### Troubleshooting

#### Prisma Client Issues
If you encounter Prisma client errors, ensure:
- The correct binary targets are included in `schema.prisma`
- OpenSSL libraries are available in the container
- Database connection is properly configured

#### Setup Page Issues
- Clear browser cache if setup page doesn't load
- Check database connectivity
- Verify no admin users exist in the database

#### Port Conflicts
- Default port is 12000
- Change in `docker-compose.yml`, `Dockerfile`, and `.env.local` if needed

## Manual Deployment (Non-Docker)

1. Install dependencies:
```bash
npm install
```

2. Generate Prisma client:
```bash
npx prisma generate
```

3. Build the application:
```bash
npm run build
```

4. Start the production server:
```bash
npm start
```

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `NEXTAUTH_URL` | Application URL | Yes | - |
| `NEXTAUTH_SECRET` | NextAuth.js secret key | Yes | - |
| `NODE_ENV` | Environment mode | No | development |
| `PORT` | Server port | No | 12000 |

## Features

- **First-time Setup**: Automatic admin account creation
- **Admin Dashboard**: User management and system settings
- **Modern UI**: Dark theme with trading-style interface
- **Authentication**: Secure credential-based auth with NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **Responsive**: Mobile-friendly design