
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return new NextResponse('Missing email or password', { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!user || !user.password) {
    return new NextResponse('Invalid credentials', { status: 401 });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return new NextResponse('Invalid credentials', { status: 401 });
  }

  return NextResponse.json({ message: 'Login successful' });
}
