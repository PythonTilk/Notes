# NoteVault - Collaborative Workspace Platform

A modern collaborative workspace platform with canvas-style notes, real-time chat, and comprehensive admin system. Inspired by [rugplay.com](https://rugplay.com/) design and built with Next.js 14, TypeScript, and PostgreSQL.

![NoteVault](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Docker](https://img.shields.io/badge/Docker-Supported-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## ✨ Features

### 🚀 Core Platform
- **🎨 Canvas Workspaces**: Drag & drop notes with positioning and resizing
- **💬 Public Chat**: Community-wide messaging with role indicators
- **📁 File Management**: Upload, organize, and share files
- **👥 User Management**: Role-based access (Admin/Moderator/User)
- **🔐 Secure Auth**: NextAuth.js with email/password and OAuth
- **⚙️ Admin Dashboard**: Real-time system monitoring and controls

### 🛠 Technical Stack
- **Next.js 14** with App Router and TypeScript
- **PostgreSQL + Prisma** for robust data management
- **Tailwind CSS** with modern responsive design
- **Docker Compose** for easy deployment
- **Role-based security** with audit logging

## 🚀 Quick Start

### Docker Compose (Recommended)

```bash
# Clone and start
git clone https://github.com/PythonTilk/Notes.git
cd Notes
git checkout modern-rewrite

# Start with Docker
docker-compose up -d --build
```

**Access**: http://localhost:12000

### Local Development

```bash
# Prerequisites: Node.js 18+, PostgreSQL 15+
git clone https://github.com/PythonTilk/Notes.git
cd Notes
git checkout modern-rewrite
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your database credentials

# Setup database and start
npx prisma db push
npm run dev
```

## 🎨 Application Pages

| Page | Route | Description |
|------|-------|-------------|
| **Dashboard** | `/` | Workspace overview and management |
| **Workspace** | `/workspaces/[id]` | Canvas with drag & drop notes |
| **Public Chat** | `/chat` | Community-wide messaging |
| **Files** | `/files` | File upload and management |
| **Admin** | `/admin` | System administration (Admin only) |

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection | ✅ |
| `NEXTAUTH_URL` | App URL (http://localhost:12000) | ✅ |
| `NEXTAUTH_SECRET` | NextAuth secret key | ✅ |
| `REDIS_URL` | Redis connection (optional) | ❌ |

## 🐳 Docker Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

## 📝 TODO List & Roadmap

### ✅ Completed Features
- **Canvas Workspaces**: Drag & drop notes with positioning and resizing
- **Public Chat System**: Community messaging with role indicators
- **File Management**: Upload, organize, and share files with search/filters
- **Admin Dashboard**: Real-time system monitoring and user management
- **User Role System**: Admin/Moderator/User with proper permissions
- **Workspace Invitations**: Email-based invitation system
- **Maintenance Mode**: Admin-only access during maintenance
- **Audit Logging**: Comprehensive activity tracking
- **System Settings**: Configurable limits and backup management

### 🎯 Next Priority Features

#### Real-time Collaboration
- [ ] **WebSocket Integration**: Replace polling with real-time connections
- [ ] **Live Cursor Tracking**: See other users' cursors in workspaces
- [ ] **Real-time Note Updates**: Live synchronization of note changes
- [ ] **User Presence Indicators**: Show who's online in each workspace

#### Enhanced Workspace Features
- [ ] **Connected Notes**: Link notes together like in n8n workflows
- [ ] **Workspace Templates**: Pre-built workspace layouts
- [ ] **Export Functionality**: Export workspace as PDF/image
- [ ] **Search Across Workspaces**: Global search functionality

#### Communication & Collaboration
- [ ] **Workspace-specific Chat**: Private chat channels per workspace
- [ ] **@Mentions & Notifications**: Tag users and send notifications
- [ ] **Message Threading**: Reply to specific messages
- [ ] **Email Notifications**: Workspace activity notifications

#### AI & Automation
- [ ] **AI Summarizer**: Automatically summarize long notes and conversations
- [ ] **Smart Note Suggestions**: AI-powered note recommendations
- [ ] **Auto-tagging**: Intelligent tag suggestions for notes

#### System Enhancements
- [ ] **Progressive Web App**: Offline functionality and mobile app experience
- [ ] **API Rate Limiting**: Protect against abuse
- [ ] **Advanced Backup System**: Incremental backups and restore
- [ ] **Multi-language Support**: Internationalization

### 🚧 Current Status

**Architecture**: ✅ Complete rewrite to collaborative workspace platform  
**Backend**: ✅ Full API implementation with security and validation  
**Frontend**: ✅ All UI pages implemented with modern design  
**Database**: ✅ Comprehensive schema with proper relationships  
**Admin System**: ✅ Full admin dashboard with real functionality  

**Ready for**: Real-time features, advanced collaboration, and production deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

<div align="center">

**🚀 NoteVault - Collaborative Workspace Platform**

*Built with ❤️ using modern web technologies*

[🌟 Star this repo](https://github.com/PythonTilk/Notes) • [🐛 Report Bug](https://github.com/PythonTilk/Notes/issues) • [✨ Request Feature](https://github.com/PythonTilk/Notes/issues)

</div>
