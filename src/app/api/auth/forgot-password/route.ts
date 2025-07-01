
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
    // For security, don't reveal if the email exists or not
    return new NextResponse("If your email is in our system, you will receive a password reset link.", { status: 200 });
  }

  // Generate a password reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordResetToken, passwordResetExpires },
  });

  // In a real application, you would send an email here
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
  console.log(`Password Reset URL: ${resetUrl}`); // Log for development

  return new NextResponse("If your email is in our system, you will receive a password reset link.", { status: 200 });
}
