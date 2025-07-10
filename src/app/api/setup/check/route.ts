import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Check if any admin user exists
    const adminCount = await prisma.user.count({
      where: {
        role: 'ADMIN'
      }
    });

    // If no admin users exist, setup is needed
    const setupNeeded = adminCount === 0;

    return NextResponse.json({ 
      success: true, 
      setupNeeded 
    });
  } catch (error) {
    console.error('Error checking setup status:', error);
    // If there's a database error, it likely means the database is not set up yet
    return NextResponse.json({ 
      success: true, 
      message: 'Database may not be initialized yet',
      setupNeeded: true // Default to true on error
    });
  }
}