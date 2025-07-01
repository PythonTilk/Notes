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

This project uses Next.js for the frontend and API routes, Prisma as the ORM for database interactions, and Tailwind CSS for styling.

## 📄 License

Licensed under the terms in the [LICENSE](LICENSE) file.
