import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id as string) },
      select: { id: true, name: true, email: true }, // Select specific fields to return
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { message: "Something went wrong", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { message: "Name and email are required" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(session.user.id as string) },
      data: { name, email },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { message: "Something went wrong", error: (error as Error).message },
      { status: 500 }
    );
  }
}
