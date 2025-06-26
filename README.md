# ITS-Projekt - Note Management System

A modern, feature-rich note-taking application built with Spring Boot. Create, organize, and share notes with advanced features like rich text editing, image uploads, and collaborative sharing.

## ✨ Features

- **Rich Text Editing** - WYSIWYG editor with formatting, lists, links, and code syntax highlighting
- **Multiple Note Types** - Text, Rich Text, and Code notes with syntax highlighting
- **User Profiles** - Custom avatars, display names, and biographies  
- **Note Sharing** - Private, shared with specific users, or public notes
- **Visual Organization** - Drag-and-drop interface with color-coded notes
- **Dark Mode** - Toggle between light and dark themes
- **Image Support** - Upload and embed images in notes
- **Search & Tags** - Find notes by content, tags, or author
- **Mobile Responsive** - Works seamlessly on desktop, tablet, and mobile

## 🚀 Quick Local Setup

### Prerequisites

- **Java 17+** (OpenJDK recommended)
- **MySQL 5.7+** or **MariaDB 10.3+**
- **Maven 3.6+** (included via wrapper)

### 1. Clone Repository

```bash
git clone https://github.com/PythonTilk/Notes.git
cd Notes
```

### 2. Install Dependencies

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install openjdk-17-jdk mariadb-server
sudo systemctl start mariadb
sudo systemctl enable mariadb
```

#### macOS:
```bash
brew install openjdk@17 mariadb
brew services start mariadb
```

#### Windows:
1. Download [OpenJDK 17](https://adoptium.net/)
2. Download [MariaDB](https://mariadb.org/download/)
3. Start MariaDB service

### 3. Setup Database

```bash
# Import database schema
mysql -u root -p < its-projekt18.6.sql

# Verify setup
mysql -u notizuser -pnotizpassword -e "SHOW TABLES;" notizprojekt
```

### 4. Run Application

```bash
# Start the application
./mvnw spring-boot:run
```

Access at: **http://localhost:12000**

**Test Account:** `testuser123` / `password123`

## 🛠️ Development

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
# Interactive setup menu
sudo ./setup.sh

# Direct installation
sudo ./setup.sh install

# One-liner (replace with your repository URL)
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/setup.sh | sudo bash -s install
```

## 🛡️ Technology Stack

- **Backend:** Spring Boot 2.7, Java 17, Spring Security
- **Database:** MySQL/MariaDB with JPA/Hibernate
- **Frontend:** Thymeleaf, HTML5, CSS3, JavaScript
- **Build:** Maven with automated deployment scripts

## 📄 License

Licensed under the terms in the [LICENSE](LICENSE) file.

---

**Need help?** Check the troubleshooting section above or see [SERVER_SETUP.md](SERVER_SETUP.md) for production deployment.
