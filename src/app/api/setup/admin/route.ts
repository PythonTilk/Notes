import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    // Check if any admin user already exists
    const adminCount = await prisma.user.count({
      where: {
        role: 'ADMIN'
      }
    });

    // If admin already exists, prevent creating another one through this endpoint
    if (adminCount > 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Setup has already been completed' 
      }, { status: 403 });
    }

    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ 
        success: false, 
        message: 'Name, email, and password are required' 
      }, { status: 400 });
    }

    // Check if email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email is already in use' 
      }, { status: 400 });
    }

    // Check if email is banned
    try {
      const bannedEmail = await prisma.bannedEmail.findUnique({
        where: { email }
      });

      if (bannedEmail) {
        return NextResponse.json({ 
          success: false, 
          message: 'This email address has been banned' 
        }, { status: 400 });
      }
    } catch (error) {
      // If the bannedEmail table doesn't exist yet, just continue
      console.log('BannedEmail table may not exist yet, continuing...');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: true // Admin is automatically verified
      }
    });

    // Create a default workspace for the admin
    await prisma.workspace.create({
      data: {
        name: 'Admin Workspace',
        description: 'Default workspace for administration',
        color: '#3B82F6',
        creatorId: user.id,
        members: {
          create: {
            userId: user.id,
            role: 'OWNER'
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Admin account created successfully' 
    });
  } catch (error) {
    console.error('Error creating admin account:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to create admin account: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
}