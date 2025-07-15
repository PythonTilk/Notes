import { prisma } from './prisma';
import { UserRole } from '@prisma/client';

export async function isSetupRequired(): Promise<boolean> {
  try {
    const adminCount = await prisma.user.count({
      where: {
        role: UserRole.ADMIN,
      },
    });
    
    return adminCount === 0;
  } catch (error) {
    // If there's a database error, assume setup is required
    console.error('Error checking setup status:', error);
    return true;
  }
}

export async function createInitialAdmin(data: {
  name: string;
  email: string;
  password: string;
}) {
  const bcrypt = await import('bcryptjs');
  const hashedPassword = await bcrypt.hash(data.password, 12);
  
  return await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: UserRole.ADMIN,
      balance: 100000.0,
      level: 10,
      experience: 10000,
    },
  });
}