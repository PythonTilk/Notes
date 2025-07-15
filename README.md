# NoteVault - Modern Note Trading Platform

A modern, full-stack note-taking application with a trading-style dashboard inspired by [rugplay.com](https://rugplay.com/). Built with Next.js 14, TypeScript, PostgreSQL, and modern web technologies.

## 🚀 Features

### Core Features
- **Modern Dashboard**: Trading-style interface with real-time updates
- **Note Management**: Create, edit, and organize notes with rich text support
- **User Authentication**: Secure authentication with NextAuth.js (OAuth + credentials)
- **Admin Dashboard**: Comprehensive admin panel for user and system management
- **Real-time Trading**: Live trading simulation with market data
- **Portfolio Management**: Track your note investments and performance
- **Leaderboards**: Competitive rankings and achievements

### Technical Features
- **Next.js 14**: App Router, Server Components, and modern React features
- **TypeScript**: Full type safety throughout the application
- **PostgreSQL**: Robust database with Prisma ORM
- **Tailwind CSS**: Modern, responsive design system
- **Real-time Updates**: Live data with optimistic updates
- **Docker Support**: Easy deployment with Docker containers
- **Admin Panel**: Complete administrative interface

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS, shadcn/ui components
- **Deployment**: Docker, Docker Compose

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 15+
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/PythonTilk/Notes.git
   cd Notes
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/notevault"
   NEXTAUTH_URL="http://localhost:53313"
   NEXTAUTH_SECRET="your-secret-key"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:53313](http://localhost:53313)

### Docker Deployment

1. **Using Docker Compose (Recommended)**
   ```bash
   docker-compose up -d
   ```

2. **Run database migrations**
   ```bash
   docker-compose exec app npx prisma migrate deploy
   docker-compose exec app npx prisma db seed
   ```

## 🔐 Default Admin Account

When no users exist in the database, an admin account is automatically created:

- **Email**: `admin@notevault.com`
- **Password**: `admin123`
- **Role**: `ADMIN`

## 🎨 Design Inspiration

The design is heavily inspired by [rugplay.com](https://rugplay.com/) with:
- Dark theme with neon accents
- Trading-style dashboard layout
- Real-time market data visualization
- Modern card-based UI components
- Responsive design for all devices

## 📱 Key Pages

- **Dashboard** (`/`): Main trading dashboard with market overview
- **Notes** (`/notes`): Note management and creation
- **Market** (`/market`): Trading marketplace for notes
- **Portfolio** (`/portfolio`): Personal investment tracking
- **Admin** (`/admin`): Administrative dashboard (admin only)
- **Leaderboard** (`/leaderboard`): User rankings and achievements

## 🔧 Development

### Database Schema

The application uses a comprehensive PostgreSQL schema with:
- **Users**: Authentication and profile management
- **Notes**: Content creation and management
- **Trades**: Trading transactions and history
- **Portfolios**: Investment tracking
- **Activities**: User activity logging

### API Routes

- `GET/POST /api/notes` - Note management
- `GET /api/users` - User management (admin only)
- `GET /api/trades` - Trading operations
- `GET /api/admin/*` - Admin operations

### Environment Variables

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - NextAuth.js secret
- OAuth provider credentials (optional)

## 🚀 Deployment

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

### Docker Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [rugplay.com](https://rugplay.com/) design and functionality
- Built with [shadcn/ui](https://ui.shadcn.com/) components
- Icons from [Lucide React](https://lucide.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

## 📞 Support

For support, email support@notevault.com or create an issue in the repository.

---

**NoteVault** - Where notes meet trading. Built with ❤️ and modern web technologies.
