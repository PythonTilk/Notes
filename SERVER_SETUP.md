# 🚀 Production Server Setup Guide

Complete guide for deploying ITS-Projekt Note Management System on a production server with SSL, security hardening, and automated management.

## 📋 Prerequisites

- **Server:** Ubuntu 20.04+ or Debian 11+ with root access
- **Domain:** Domain name pointing to your server's IP address
- **Resources:** At least 2GB RAM and 10GB disk space
- **Email:** Valid email address for SSL certificate notifications

## ⚡ Quick Installation

### One-Command Setup

```bash
bash <(curl -Ss https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/setup.sh || wget -O - https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/setup.sh) install
```

### Automated Setup (No Prompts)

```bash
DOMAIN="your-domain.com" EMAIL="your-email@example.com" DB_PASSWORD="your-secure-password" SKIP_PROMPTS="true" bash <(curl -Ss https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/setup.sh || wget -O - https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/setup.sh) install
```

### Interactive Menu

```bash
bash <(curl -Ss https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/setup.sh || wget -O - https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/setup.sh)
```

### Manual Installation

```bash
# Clone repository and run setup
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
sudo ./setup.sh install
```

> **Note:** Replace `YOUR_USERNAME/YOUR_REPO` with your actual GitHub repository path.

## 🔧 What Gets Installed

The installation script automatically configures:

### System Dependencies
- ✅ **Java 17** (OpenJDK)
- ✅ **Maven 3.8+** for building
- ✅ **MySQL 8.0** database server
- ✅ **Nginx** reverse proxy
- ✅ **Certbot** for Let's Encrypt SSL certificates
- ✅ **UFW Firewall** configured for HTTP/HTTPS only

### Application Setup
- ✅ **Dedicated User** (`notizprojekt`) for security
- ✅ **Systemd Service** for automatic startup/restart
- ✅ **SSL Certificate** with auto-renewal
- ✅ **Database** with secure user and permissions
- ✅ **File Uploads** directory with proper permissions
- ✅ **Automated Backups** scheduled daily

### Security Features
- ✅ **Non-root execution** - Application runs as dedicated user
- ✅ **Firewall configuration** - Only HTTP/HTTPS ports open
- ✅ **SSL encryption** - HTTPS with Let's Encrypt certificates
- ✅ **Database security** - Dedicated user with minimal permissions
- ✅ **File permissions** - Proper ownership and access controls

## 📍 Important Locations

After installation, key files and directories:

```
/opt/notizprojekt/                    # Application home
├── ITS-Projekt/                      # Application code
│   ├── target/                       # Built JAR files
│   ├── update.sh                     # Update script
│   └── uploads/                      # User uploaded files
├── logs/                             # Application logs
├── backups/                          # Automated backups
└── .env                              # Environment configuration
```

### Configuration Files
- **Application Config:** `/opt/notizprojekt/ITS-Projekt/src/main/resources/application.properties`
- **Environment Variables:** `/opt/notizprojekt/.env`
- **Nginx Config:** `/etc/nginx/sites-available/notizprojekt`
- **Systemd Service:** `/etc/systemd/system/notizprojekt.service`

## 🛠️ Management Commands

### Service Management

```bash
# Check application status
sudo systemctl status notizprojekt

# Start/stop/restart application
sudo systemctl start notizprojekt
sudo systemctl stop notizprojekt
sudo systemctl restart notizprojekt

# Enable/disable auto-start
sudo systemctl enable notizprojekt
sudo systemctl disable notizprojekt
```

### Log Monitoring

```bash
# View real-time logs
sudo journalctl -u notizprojekt -f

# View application logs
tail -f /opt/notizprojekt/logs/application.log

# View recent service logs
sudo journalctl -u notizprojekt -n 50
```

### Application Management

```bash
# Update application
sudo /opt/notizprojekt/Notes/setup.sh update

# Management commands
sudo /opt/notizprojekt/Notes/setup.sh status    # Check status
sudo /opt/notizprojekt/Notes/setup.sh start     # Start application
sudo /opt/notizprojekt/Notes/setup.sh stop      # Stop application
sudo /opt/notizprojekt/Notes/setup.sh logs      # View logs
sudo /opt/notizprojekt/Notes/setup.sh backup    # Create backup

# Interactive menu
sudo /opt/notizprojekt/Notes/setup.sh
```

## 🔄 Update Management

### Manual Updates

```bash
# Using the setup script (recommended)
sudo /opt/notizprojekt/Notes/setup.sh update

# Or manually
sudo su - notizprojekt
cd /opt/notizprojekt/Notes
git pull origin main
./mvnw clean package
sudo systemctl restart notizprojekt
```

### Automated Updates

Set up weekly automatic updates:

```bash
# Edit crontab for root user
sudo crontab -e

# Add weekly update (Sunday 3 AM)
0 3 * * 0 /opt/notizprojekt/Notes/setup.sh update
```

### Backup Before Updates

The update script automatically creates backups, but you can manually backup:

```bash
# Create manual backup
sudo -u notizprojekt cp /opt/notizprojekt/ITS-Projekt/target/*.jar \
  /opt/notizprojekt/backups/manual_backup_$(date +%Y%m%d_%H%M%S).jar

# Database backup
sudo -u notizprojekt mysqldump -u notizuser -p notizprojekt > \
  /opt/notizprojekt/backups/db_backup_$(date +%Y%m%d_%H%M%S).sql
```

## 🆘 Troubleshooting

### Application Won't Start

```bash
# Check service status
sudo systemctl status notizprojekt

# View detailed logs
sudo journalctl -u notizprojekt -n 100

# Check if port is in use
sudo netstat -tlnp | grep :12000

# Verify JAR file exists
ls -la /opt/notizprojekt/ITS-Projekt/target/*.jar
```

### Database Connection Issues

```bash
# Test database connection
mysql -u notizuser -p notizprojekt

# Check MySQL service
sudo systemctl status mysql

# Restart MySQL if needed
sudo systemctl restart mysql
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificates manually
sudo certbot renew

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Update Failures

```bash
# Check git status
sudo -u notizprojekt git status

# Reset to clean state
sudo -u notizprojekt git reset --hard HEAD
sudo -u notizprojekt git clean -fd

# Rebuild application
sudo -u notizprojekt ./mvnw clean package
```

### Rollback to Previous Version

```bash
# Stop application
sudo systemctl stop notizprojekt

# List available backups
ls -la /opt/notizprojekt/backups/

# Restore from backup
sudo -u notizprojekt cp /opt/notizprojekt/backups/backup_YYYYMMDD_HHMMSS.jar \
  /opt/notizprojekt/ITS-Projekt/target/notizprojekt-web-0.0.1-SNAPSHOT.jar

# Start application
sudo systemctl start notizprojekt
```

## 🔐 Security Considerations

### Firewall Configuration

```bash
# Check firewall status
sudo ufw status

# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Database Security

```bash
# Secure MySQL installation
sudo mysql_secure_installation

# Check user permissions
mysql -u root -p -e "SHOW GRANTS FOR 'notizuser'@'localhost';"
```

### File Permissions

```bash
# Verify application permissions
ls -la /opt/notizprojekt/
ls -la /opt/notizprojekt/ITS-Projekt/uploads/

# Fix permissions if needed
sudo chown -R notizprojekt:notizprojekt /opt/notizprojekt/
sudo chmod -R 755 /opt/notizprojekt/ITS-Projekt/
sudo chmod -R 775 /opt/notizprojekt/ITS-Projekt/uploads/
```

## 📊 Monitoring & Maintenance

### Health Checks

```bash
# Test application endpoint
curl -I https://your-domain.com

# Check database connectivity
mysql -u notizuser -p -e "SELECT COUNT(*) FROM notizprojekt.nutzer;"

# Monitor system resources
free -h          # Memory usage
df -h            # Disk usage
top              # CPU usage
```

### Log Rotation

Application logs are automatically rotated. To configure:

```bash
# Edit logrotate configuration
sudo nano /etc/logrotate.d/notizprojekt
```

### Backup Verification

```bash
# List recent backups
ls -la /opt/notizprojekt/backups/ | head -10

# Test backup restoration (in test environment)
java -jar /opt/notizprojekt/backups/backup_YYYYMMDD_HHMMSS.jar
```

## 🎯 Post-Installation Checklist

After successful installation:

- [ ] **Access Application:** Visit `https://your-domain.com`
- [ ] **Create Admin Account:** Register first user account
- [ ] **Test Functionality:** Create notes, upload images, test sharing
- [ ] **Verify SSL:** Check certificate is valid and auto-renewal works
- [ ] **Monitor Logs:** Ensure no errors in application logs
- [ ] **Test Updates:** Run `./update.sh --status` to verify update system
- [ ] **Backup Verification:** Check that backups are being created
- [ ] **Firewall Check:** Verify only necessary ports are open

## 📞 Support & Maintenance

### Regular Maintenance Tasks

**Weekly:**
- Check application logs for errors
- Verify SSL certificate status
- Monitor disk space usage

**Monthly:**
- Review and clean old backups
- Update system packages: `sudo apt update && sudo apt upgrade`
- Check for application updates

**Quarterly:**
- Review security configurations
- Test backup restoration process
- Update documentation if needed

### Getting Help

1. **Check Logs:** Always start with application and system logs
2. **Verify Configuration:** Ensure all configuration files are correct
3. **Test Components:** Test database, web server, and application separately
4. **Review Documentation:** Check this guide and application README

---

**🎉 Your ITS-Projekt is now ready for production use!**

Access your application at `https://your-domain.com` and start creating notes!