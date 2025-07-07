# NoteVault - A Modern Note Management System (Node.js & React)

A feature-rich note-taking application rewritten using Node.js, React, and Next.js, with PostgreSQL as the database.

## ✨ Features Implemented

*   **User Authentication:** Secure user registration, login, and session management using NextAuth.js.
*   **Multiple Note Types:** Support for Text, Rich Text (WYSIWYG editor powered by TipTap), and Code notes (with syntax highlighting).
*   **User Profiles:** Users can manage their name, email, and biography. Placeholder for avatar uploads.
*   **Note Sharing:** Notes can be marked as public or private. (Sharing with specific users is implemented in the backend schema, but UI is pending).
*   **Visual Organization:** Drag-and-drop functionality for notes on the dashboard using dnd-kit.
*   **Dark Mode:** A toggle for switching between light and dark themes.
*   **Image Support:** Basic image upload functionality (images are currently base64 encoded and stored directly in the database; a proper cloud storage solution would be needed for production).
*   **Search & Tags:** Search notes by title, content, or tags. Notes can have multiple tags.
*   **Mobile Responsiveness:** Designed to adapt to various screen sizes.
*   **Admin Panel:** Basic admin functionalities including user management (viewing and updating roles) and banned email management (viewing, adding, and removing banned emails).
*   **Email Services (Placeholder):** API endpoints for password reset and email verification are in place, with console logs indicating where emails would be sent in a real setup.

## 🚀 Quick Local Setup

### Prerequisites

*   **Node.js** (LTS recommended)
*   **PostgreSQL** (version 10+ recommended)

### 1. Clone Repository

```bash
git clone https://github.com/PythonTilk/Notes.git
cd Notes
git checkout feature/node-react-rewrite
```

### 2. Database Setup (PostgreSQL)

If you don't have PostgreSQL installed and running, here are instructions for Arch Linux:

```bash
# Install PostgreSQL
sudo pacman -S postgresql

# Initialize the database cluster (only run once after installation)
sudo -u postgres initdb --locale $LANG -E UTF8 -D '/var/lib/postgres/data'

# Start and Enable the PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create a database and optionally a user (you can use the default 'postgres' user for local dev)
sudo -i -u postgres psql
# Inside psql, run:
CREATE DATABASE notevault;
# If you want a dedicated user (replace your_username and your_password):
CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE notevault TO your_username;
\q
exit
```

### 3. Environment Variables

Create a `.env` file in the root of the project (`/home/tilk/Notes/.env`) and add your database connection string and a NextAuth.js secret. Replace `your_username` and `your_password` with your PostgreSQL credentials.

```
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/notevault"
NEXTAUTH_SECRET="your-super-secret-string-here" # Generate a strong random string for production
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Prisma Migrations

This will create the necessary tables in your PostgreSQL database based on the schema defined in `prisma/schema.prisma`.

```bash
npx prisma db push --accept-data-loss
```

### 6. Run Application

```bash
npm run dev
```

Access the application at: **http://localhost:3000**

## 🛠️ Development

<<<<<<< HEAD
### Project Structure

```
src/main/
├── java/notizprojekt/web/
│   ├── NotizprojektWebApplication.java    # Main application
│   ├── controller/                        # Web & API controllers
│   ├── model/                            # Entity classes (User, Note)
│   ├── service/                          # Business logic
│   ├── repository/                       # Data access layer
│   └── config/                           # Configuration classes
├── resources/
│   ├── application.properties            # App configuration
│   ├── static/                          # CSS, JS, images
│   └── templates/                       # Thymeleaf templates
└── its-projekt18.6.sql                  # Database schema
```

### Configuration

Edit `src/main/resources/application.properties`:

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/notizprojekt
spring.datasource.username=notizuser
spring.datasource.password=notizpassword

# Server
server.port=12000
server.address=0.0.0.0

# File Upload
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=25MB

# Development
spring.thymeleaf.cache=false
logging.level.notizprojekt=DEBUG
```

### Building for Production

```bash
# Build JAR file
./mvnw clean package

# Run production build
java -jar target/notizprojekt-web-0.0.1-SNAPSHOT.jar
```

## 🧪 Testing

```bash
# Run all tests
./mvnw test

# Run with coverage
./mvnw test jacoco:report
```

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Creating different note types (text, rich text, code)
- [ ] Rich text editor toolbar functionality
- [ ] Note sharing and privacy settings
- [ ] Image upload functionality
- [ ] Profile management with avatar upload
- [ ] Search and filtering
- [ ] Dark mode toggle
- [ ] Mobile responsiveness
- [ ] Note view modal for public notes

## 🔧 Troubleshooting

### Common Issues

**Port already in use:**
```bash
sudo lsof -t -i:12000 | xargs kill -9
```

**Database connection failed:**
```bash
sudo systemctl status mariadb
mysql -u notizuser -pnotizpassword -h localhost notizprojekt
```

**Java version issues:**
```bash
java -version  # Should show Java 17+
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
```

**Maven build issues:**
```bash
rm -rf ~/.m2/repository
./mvnw clean install
```

## 🌐 Production Deployment

For production server setup with SSL, domain configuration, and security hardening:

**[SERVER_SETUP.md](SERVER_SETUP.md)** - Complete production deployment guide

### Quick Production Install

```bash
# One-liner (Method 1)
curl -fsSL https://raw.githubusercontent.com/PythonTilk/Notes/main/setup.sh | sudo bash -s install

# One-liner (Method 2)
sudo bash -c "$(curl -fsSL https://raw.githubusercontent.com/PythonTilk/Notes/main/setup.sh)" install

# One-liner (Method 3 - with wget fallback)
sudo bash -c "$(curl -fsSL https://raw.githubusercontent.com/PythonTilk/Notes/main/setup.sh 2>/dev/null || wget -qO- https://raw.githubusercontent.com/PythonTilk/Notes/main/setup.sh)" install
```

## 🛡️ Technology Stack

- **Backend:** Spring Boot 2.7, Java 17, Spring Security
- **Database:** MySQL/MariaDB with JPA/Hibernate
- **Frontend:** Thymeleaf, HTML5, CSS3, JavaScript
- **Build:** Maven with automated deployment scripts
=======
This project uses Next.js for the frontend and API routes, Prisma as the ORM for database interactions, and Tailwind CSS for styling.
>>>>>>> feature/node-react-rewrite

## 📄 License

Licensed under the terms in the [LICENSE](LICENSE) file.
