import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Check if any users exist
  const userCount = await prisma.user.count();
  
  if (userCount === 0) {
    console.log('👤 No users found, creating admin user...');
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@notevault.com',
        name: 'Admin User',
        username: 'admin',
        password: hashedPassword,
        role: UserRole.ADMIN,
        bio: 'System Administrator',
        balance: 100000.0, // Admin gets more starting balance
        level: 10,
        experience: 10000,
      },
    });

    console.log('✅ Admin user created:', adminUser.email);

    // Create some sample notes for the admin
    const sampleNotes = [
      {
        title: 'Welcome to NoteVault',
        content: 'This is your new modern note-taking application with trading-style dashboard!',
        type: 'TEXT' as const,
        visibility: 'PUBLIC' as const,
        tags: ['welcome', 'getting-started'],
        color: '#00ff88',
        marketCap: 1000000,
        volume24h: 50000,
        priceChange: 5.2,
      },
      {
        title: 'Trading Dashboard Features',
        content: `# Trading Dashboard Features

## Live Market Data
- Real-time note valuations
- 24h volume tracking
- Price change indicators

## Portfolio Management
- Track your note investments
- View profit/loss
- Portfolio analytics

## Admin Features
- User management
- System monitoring
- Analytics dashboard`,
        type: 'MARKDOWN' as const,
        visibility: 'PUBLIC' as const,
        tags: ['features', 'dashboard', 'admin'],
        color: '#0088ff',
        marketCap: 750000,
        volume24h: 25000,
        priceChange: -2.1,
      },
      {
        title: 'Code Example',
        content: `// Example TypeScript code
interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
}

const createUser = async (userData: Partial<User>) => {
  return await prisma.user.create({
    data: userData
  });
};`,
        type: 'CODE' as const,
        visibility: 'PRIVATE' as const,
        tags: ['code', 'typescript', 'example'],
        color: '#8800ff',
        marketCap: 500000,
        volume24h: 15000,
        priceChange: 12.5,
      },
    ];

    for (const noteData of sampleNotes) {
      await prisma.note.create({
        data: {
          ...noteData,
          authorId: adminUser.id,
        },
      });
    }

    console.log('📝 Sample notes created');

    // Create some sample activities
    await prisma.activity.create({
      data: {
        type: 'NOTE_CREATED',
        title: 'Welcome Note Created',
        description: 'Created the welcome note for new users',
        userId: adminUser.id,
      },
    });

    await prisma.activity.create({
      data: {
        type: 'LEVEL_UP',
        title: 'Admin Level Achieved',
        description: 'Reached admin level with full system access',
        userId: adminUser.id,
      },
    });

    console.log('📊 Sample activities created');

    // Create a sample notification
    await prisma.notification.create({
      data: {
        type: 'SYSTEM',
        title: 'Welcome to NoteVault',
        message: 'Your account has been set up successfully. Explore the trading-style dashboard!',
        userId: adminUser.id,
      },
    });

    console.log('🔔 Sample notification created');

  } else {
    console.log(`👥 Found ${userCount} existing users, skipping seed`);
  }

  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });