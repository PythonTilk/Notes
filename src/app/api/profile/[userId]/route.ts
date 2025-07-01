
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  const userId = parseInt(params.userId);

  if (isNaN(userId)) {
    return new NextResponse("Invalid User ID", { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, biography: true, avatar: true }, // Select specific fields
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return new NextResponse("Error fetching user profile", { status: 500 });
  }
}
