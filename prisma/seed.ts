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
        password: hashedPassword,
        role: UserRole.ADMIN,
        bio: 'System Administrator',
      },
    });

    console.log('✅ Admin user created:', adminUser.email);

    // Create a default workspace for the admin
    const defaultWorkspace = await prisma.workspace.create({
      data: {
        name: 'My Workspace',
        description: 'Default workspace for getting started',
        ownerId: adminUser.id,
        members: {
          create: {
            userId: adminUser.id,
            role: 'OWNER',
          }
        }
      }
    });

    console.log('✅ Default workspace created:', defaultWorkspace.name);

    // Create some sample notes for the admin
    const sampleNotes = [
      {
        title: 'Welcome to NoteVault',
        content: 'This is your new modern note-taking application with collaborative features!',
        type: 'TEXT' as const,
        color: '#00ff88',
        workspaceId: defaultWorkspace.id,
      },
      {
        title: 'Collaboration Features',
        content: `# Collaboration Features

## Real-time Editing
- Live collaborative editing
- See other users' cursors
- Instant synchronization

## Workspace Management
- Create and manage workspaces
- Invite team members
- Role-based permissions

## Admin Features
- User management
- System monitoring
- Analytics dashboard`,
        type: 'MARKDOWN' as const,
        color: '#0088ff',
        workspaceId: defaultWorkspace.id,
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
        color: '#8800ff',
        workspaceId: defaultWorkspace.id,
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
        type: 'USER_ROLE_CHANGED',
        title: 'Admin Level Achieved',
        description: 'Reached admin level with full system access',
        userId: adminUser.id,
      },
    });

    console.log('📊 Sample activities created');

    console.log('✅ Sample data created successfully');

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