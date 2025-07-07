
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'ADMIN') {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const bannedEmails = await prisma.bannedEmail.findMany();
    return NextResponse.json(bannedEmails);
  } catch (error) {
    console.error("Error fetching banned emails:", error);
    return new NextResponse("Error fetching banned emails", { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'ADMIN') {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const { email } = await request.json();

  if (!email) {
    return new NextResponse("Email is required", { status: 400 });
  }

  try {
    const bannedEmail = await prisma.bannedEmail.create({
      data: { email },
    });
    return NextResponse.json(bannedEmail);
  } catch (error) {
    console.error("Error banning email:", error);
    return new NextResponse("Error banning email", { status: 500 });
  }
}
