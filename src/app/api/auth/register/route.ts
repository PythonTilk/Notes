
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const body = await request.json();
  const { email, name, password } = body;

  if (!email || !password) {
    return new NextResponse('Missing email or password', { status: 400 });
  }

  // Check if email is banned
  const banned = await prisma.bannedEmail.findUnique({
    where: { email: email },
  });

  if (banned) {
    return new NextResponse('This email address is banned.', { status: 403 });
  }

  const exist = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (exist) {
    return new NextResponse('User already exists', { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      emailVerified: false,
      emailVerificationToken,
    },
  });

  // In a real application, you would send an email here
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${emailVerificationToken}`;
  console.log(`Email Verification URL: ${verificationUrl}`); // Log for development

  return NextResponse.json(user);
}
