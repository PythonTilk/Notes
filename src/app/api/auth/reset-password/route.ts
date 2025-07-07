
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { token, password } = await request.json();

  if (!token || !password) {
    return new NextResponse("Token and new password are required", { status: 400 });
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: { gt: new Date() },
    },
  });

  if (!user) {
    return new NextResponse("Invalid or expired token", { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  return new NextResponse("Password has been reset successfully", { status: 200 });
}
