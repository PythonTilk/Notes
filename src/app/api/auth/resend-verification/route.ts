
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return new NextResponse("Email is required", { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return new NextResponse("User not found", { status: 404 });
  }

  if (user.emailVerified) {
    return new NextResponse("Email already verified", { status: 400 });
  }

  const emailVerificationToken = crypto.randomBytes(32).toString('hex');

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerificationToken },
  });

  // In a real application, you would send an email here
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${emailVerificationToken}`;
  console.log(`Resent Email Verification URL: ${verificationUrl}`); // Log for development

  return new NextResponse("Verification email sent", { status: 200 });
}
