
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { token } = await request.json();

  if (!token) {
    return new NextResponse("Verification token is required", { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      return new NextResponse("Invalid or expired verification token", { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
      },
    });

    return new NextResponse("Email verified successfully", { status: 200 });
  } catch (error) {
    console.error("Error verifying email:", error);
    return new NextResponse("Error verifying email", { status: 500 });
  }
}
