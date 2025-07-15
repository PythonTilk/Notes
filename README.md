# NoteVault - Modern Note Trading Platform

A modern, full-stack note-taking application with a trading-style dashboard inspired by [rugplay.com](https://rugplay.com/). Built with Next.js 14, TypeScript, PostgreSQL, and modern web technologies.

![NoteVault Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Docker](https://img.shields.io/badge/Docker-Supported-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## ✨ What's New in Modern Rewrite

🎉 **Complete rewrite with modern architecture and enhanced features!**

### 🚀 Core Features
- **🎯 Trading-Style Dashboard**: Real-time interface inspired by rugplay.com
- **📝 Advanced Note Management**: Rich text editor with full CRUD operations
- **🔐 Secure Authentication**: NextAuth.js with multiple OAuth providers
- **👑 Comprehensive Admin Panel**: Complete user and system management
- **💰 Virtual Trading System**: Simulate note trading with virtual currency
- **📊 Portfolio Tracking**: Monitor your investments and performance
- **🏆 Leaderboards**: Competitive rankings and achievements
- **🔄 Real-time Updates**: Live data synchronization across all users

### 🛠 Technical Excellence
- **⚡ Next.js 14**: App Router, Server Components, and React Server Components
- **🔷 Full TypeScript**: End-to-end type safety with strict mode
- **🐘 PostgreSQL + Prisma**: Robust database with modern ORM
- **🎨 Modern UI**: Tailwind CSS + shadcn/ui components
- **🐳 Docker Ready**: Complete containerization with Docker Compose
- **🔧 Auto-Setup**: Automatic database migrations and admin account creation
- **📱 Responsive Design**: Mobile-first approach with perfect mobile experience

## 🛠 Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Frontend** | Next.js | 14.x |
| **Language** | TypeScript | 5.x |
| **Database** | PostgreSQL | 15+ |
| **ORM** | Prisma | 5.x |
| **Authentication** | NextAuth.js | 4.x |
| **Styling** | Tailwind CSS | 3.x |
| **UI Components** | shadcn/ui | Latest |
| **Deployment** | Docker + Compose | Latest |
| **Runtime** | Node.js | 18+ |

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

**One-command setup with everything included:**

```bash
# Clone and navigate
git clone https://github.com/PythonTilk/Notes.git
cd Notes
git checkout modern-rewrite

# One-command setup (includes PostgreSQL, Redis, and app)
./docker-compose-helper.sh setup
```

**That's it!** 🎉 
- Access your app at: http://localhost:12000
- Automatic database setup and migrations
- Admin account creation on first visit

### Option 2: Local Development

**Prerequisites:**
- Node.js 18+
- PostgreSQL 15+
- Redis (optional)

```bash
# 1. Clone and install
git clone https://github.com/PythonTilk/Notes.git
cd Notes
git checkout modern-rewrite
npm install

# 2. Setup environment
cp .env.example .env.local
# Edit .env.local with your database credentials

# 3. Setup database
npx prisma db push
npx prisma generate

# 4. Start development server
npm run dev
```

Open http://localhost:12000 and create your admin account!

## 🔐 First-Time Setup

### Automatic Admin Creation
When you first access the application, you'll be redirected to `/setup` where you can:
- Create your admin account with custom credentials
- Set your preferred username and email
- Choose a secure password
- Get started with $100,000 virtual currency

### Default Configuration
- **Port**: 12000 (configurable)
- **Database**: PostgreSQL with automatic migrations
- **Cache**: Redis for sessions and real-time features
- **Authentication**: Email/password + OAuth providers

## 🎨 Design & Features

### Design Inspiration
Heavily inspired by [rugplay.com](https://rugplay.com/) and [rugplay GitHub](https://github.com/outpoot/rugplay):
- 🌙 **Dark Theme**: Professional dark interface with neon accents
- 📊 **Trading Dashboard**: Real-time market-style data visualization
- 💎 **Modern UI**: Clean, card-based components with smooth animations
- 📱 **Responsive**: Perfect experience on desktop, tablet, and mobile
- ⚡ **Fast**: Optimized performance with Next.js 14

### 📱 Application Structure

| Page | Route | Description | Access |
|------|-------|-------------|---------|
| **Dashboard** | `/` | Main trading interface with market overview | All Users |
| **Notes** | `/notes` | Create, edit, and manage your notes | All Users |
| **Market** | `/market` | Trading marketplace for note investments | All Users |
| **Portfolio** | `/portfolio` | Track your investments and performance | All Users |
| **Admin Panel** | `/admin` | User management and system settings | Admin Only |
| **Leaderboard** | `/leaderboard` | Rankings and user achievements | All Users |
| **Setup** | `/setup` | First-time admin account creation | Setup Only |

### 🔧 Admin Dashboard Features
- **👥 User Management**: View, edit, and manage all users
- **📊 System Analytics**: Monitor application performance
- **⚙️ Settings**: Configure application-wide settings
- **🔐 Security**: Manage authentication and permissions
- **📈 Statistics**: Real-time usage and trading statistics

## 🐳 Docker Management

### Quick Commands
```bash
# Setup everything (first time)
./docker-compose-helper.sh setup

# Start services
./docker-compose-helper.sh start

# View logs
./docker-compose-helper.sh logs-app

# Rebuild after changes
./docker-compose-helper.sh rebuild

# Stop everything
./docker-compose-helper.sh stop

# Reset everything (WARNING: deletes data)
./docker-compose-helper.sh clean
```

### Manual Docker Commands
```bash
# Build and start
docker compose up -d --build

# View logs
docker compose logs -f app

# Access database
docker compose exec postgres psql -U postgres -d notevault

# Run Prisma commands
docker compose exec app npx prisma studio
```

## 🔧 Development

### Project Structure
```
Notes/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Authentication pages
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   └── admin/            # Admin-specific components
├── lib/                  # Utilities and configurations
├── prisma/               # Database schema and migrations
├── docker-compose.yml    # Docker services configuration
├── Dockerfile           # Application container
└── docker-entrypoint.sh # Startup script with DB migrations
```

### Database Schema
- **Users**: Authentication, profiles, and balances
- **Notes**: Content creation and management
- **Trades**: Trading transactions and history
- **Activities**: User activity and audit logging
- **Sessions**: NextAuth.js session management

### API Routes
- `POST /api/setup` - Initial admin account creation
- `GET/POST /api/notes` - Note CRUD operations
- `GET /api/admin/users` - User management (admin only)
- `GET /api/admin/stats` - System statistics (admin only)

## 🚀 Production Deployment

### Docker Production (Recommended)

1. **Clone and configure**
   ```bash
   git clone https://github.com/PythonTilk/Notes.git
   cd Notes
   git checkout modern-rewrite
   cp .env.example .env.local
   ```

2. **Update environment for production**
   ```bash
   # Edit .env.local
   NEXTAUTH_SECRET="your-super-secure-secret-key"
   NEXTAUTH_URL="https://your-domain.com"
   DATABASE_URL="postgresql://user:pass@your-db-host:5432/notevault"
   ```

3. **Deploy with Docker Compose**
   ```bash
   docker compose up -d --build
   ```

### Manual Deployment

1. **Install dependencies and build**
   ```bash
   npm install
   npm run build
   ```

2. **Setup database**
   ```bash
   npx prisma db push
   ```

3. **Start production server**
   ```bash
   npm start
   ```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `NEXTAUTH_URL` | Your application URL | ✅ |
| `NEXTAUTH_SECRET` | NextAuth.js secret key | ✅ |
| `REDIS_URL` | Redis connection string | ❌ |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | ❌ |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | ❌ |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | ❌ |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret | ❌ |

## 📚 Documentation

- **[Docker Compose Setup Guide](DOCKER_COMPOSE_SETUP.md)** - Complete Docker setup instructions
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment guide
- **[API Documentation](docs/api.md)** - API endpoints and usage (coming soon)

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Follow TypeScript best practices
   - Add tests if applicable
   - Update documentation
4. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
5. **Push and create PR**
   ```bash
   git push origin feature/amazing-feature
   ```

### Development Guidelines
- Use TypeScript for all new code
- Follow the existing code style
- Test your changes with Docker Compose
- Update documentation as needed

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **Docker build fails** | Run `./docker-compose-helper.sh rebuild` |
| **Database connection error** | Check PostgreSQL is running and credentials are correct |
| **Port already in use** | Change port in `docker-compose.yml` and `.env.local` |
| **Setup page not loading** | Clear browser cache and check database connection |

### Getting Help
- 📖 Check the [Docker Compose Setup Guide](DOCKER_COMPOSE_SETUP.md)
- 🐛 Create an issue on GitHub
- 💬 Join our community discussions

## 🙏 Acknowledgments

- **Design Inspiration**: [rugplay.com](https://rugplay.com/) and [rugplay GitHub](https://github.com/outpoot/rugplay)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Framework**: [Next.js](https://nextjs.org/)
- **Database**: [Prisma](https://prisma.io/) + [PostgreSQL](https://postgresql.org/)

## 📝 TODO List & Roadmap

### 🎯 Planned Features

#### Real-time Collaboration
- [ ] **Live Cursor Tracking**: See other users' cursors in workspaces
- [ ] **Real-time Note Updates**: Live synchronization of note changes
- [ ] **User Presence Indicators**: Show who's online in each workspace
- [ ] **WebSocket Integration**: Replace polling with real-time connections

#### Enhanced Workspace Features
- [ ] **Workspace Templates**: Pre-built workspace layouts
- [ ] **Export Functionality**: Export workspace as PDF/image
- [ ] **Workspace Activity Feeds**: Timeline of all workspace activities
- [ ] **Search Across Workspaces**: Global search functionality
- [ ] **Connected Notes**: Link notes together like in n8n workflows
- [ ] **Note Relationships**: Visual connections between related notes

#### Advanced File Management
- [ ] **File Sharing**: Share files within workspaces
- [ ] **Image Preview & Editing**: Built-in image viewer and basic editing
- [ ] **File Version History**: Track changes to uploaded files
- [ ] **Drag & Drop Upload**: Direct file upload to canvas

#### Communication Features
- [ ] **Workspace-specific Chat**: Private chat channels per workspace
- [ ] **@Mentions & Notifications**: Tag users and send notifications
- [ ] **Message Threading**: Reply to specific messages
- [ ] **Emoji Reactions**: React to messages with emojis

#### AI & Automation
- [ ] **AI Summarizer**: Automatically summarize long notes and conversations
- [ ] **Smart Note Suggestions**: AI-powered note recommendations
- [ ] **Auto-tagging**: Intelligent tag suggestions for notes
- [ ] **Content Analysis**: Extract insights from workspace content

#### System Enhancements
- [ ] **Advanced Backup System**: Incremental backups and restore functionality
- [ ] **System Health Dashboard**: Comprehensive monitoring and alerts
- [ ] **API Rate Limiting**: Protect against abuse
- [ ] **Advanced Audit Logs**: More detailed tracking and reporting
- [ ] **Multi-language Support**: Internationalization
- [ ] **Plugin System**: Extensible architecture for custom features

#### Mobile & Accessibility
- [ ] **Progressive Web App**: Offline functionality and mobile app experience
- [ ] **Touch Gestures**: Mobile-optimized interactions
- [ ] **Accessibility Improvements**: WCAG compliance
- [ ] **Keyboard Shortcuts**: Power user features

#### Integration & API
- [ ] **REST API Documentation**: Complete API documentation
- [ ] **Webhook Support**: External integrations
- [ ] **Third-party Integrations**: Slack, Discord, GitHub, etc.
- [ ] **Import/Export**: Support for various file formats

### 🚧 Current Architecture Pivot

**Status**: Transitioning from trading-style app to collaborative workspace platform

**Completed**:
- ✅ Database schema redesign for workspaces
- ✅ Admin dashboard with real functionality
- ✅ User role management (Admin/Moderator/User)
- ✅ System settings with maintenance mode
- ✅ Audit logging and security features
- ✅ Canvas-style note system with drag & drop
- ✅ Public chat system
- ✅ File management system
- ✅ Trash system with 24h retention
- ✅ Admin announcements with expiry

**In Progress**:
- 🔄 UI components for new architecture
- 🔄 Real-time features implementation
- 🔄 Workspace invitation system
- 🔄 Enhanced admin dashboard

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**🚀 NoteVault - Where Notes Meet Trading**

*Built with ❤️ using modern web technologies*

[![GitHub stars](https://img.shields.io/github/stars/PythonTilk/Notes?style=social)](https://github.com/PythonTilk/Notes)
[![GitHub forks](https://img.shields.io/github/forks/PythonTilk/Notes?style=social)](https://github.com/PythonTilk/Notes/fork)

[🌟 Star this repo](https://github.com/PythonTilk/Notes) • [🐛 Report Bug](https://github.com/PythonTilk/Notes/issues) • [✨ Request Feature](https://github.com/PythonTilk/Notes/issues)

</div>
