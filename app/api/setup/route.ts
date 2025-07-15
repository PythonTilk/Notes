import { NextRequest, NextResponse } from 'next/server';
import { isSetupRequired, createInitialAdmin } from '@/lib/setup';

export async function GET() {
  try {
    const setupRequired = await isSetupRequired();
    return NextResponse.json({ setupRequired });
  } catch (error) {
    console.error('Error checking setup status:', error);
    return NextResponse.json(
      { error: 'Failed to check setup status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if setup is still required
    const setupRequired = await isSetupRequired();
    if (!setupRequired) {
      return NextResponse.json(
        { error: 'Setup has already been completed' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, email, password } = body;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Create the initial admin user
    const user = await createInitialAdmin({
      name,
      email,
      password,
    });

    return NextResponse.json({
      message: 'Admin account created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error creating admin account:', error);
    
    // Handle specific Prisma errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create admin account' },
      { status: 500 }
    );
  }
}