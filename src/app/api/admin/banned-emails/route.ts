import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const bannedEmails = await prisma.bannedEmail.findMany();

    return NextResponse.json(bannedEmails);
  } catch (error) {
    console.error("Error fetching banned emails:", error);
    return NextResponse.json(
      { message: "Something went wrong", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const existingBannedEmail = await prisma.bannedEmail.findUnique({ where: { email } });
    if (existingBannedEmail) {
      return NextResponse.json({ message: "Email is already banned" }, { status: 409 });
    }

    const bannedEmail = await prisma.bannedEmail.create({
      data: { email },
    });

    return NextResponse.json(bannedEmail, { status: 201 });
  } catch (error) {
    console.error("Error banning email:", error);
    return NextResponse.json(
      { message: "Something went wrong", error: (error as Error).message },
      { status: 500 }
    );
  }
}
