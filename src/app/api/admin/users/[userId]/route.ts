
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: { userId: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'ADMIN') {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const userId = parseInt(params.userId);
  const { role } = await request.json();

  if (isNaN(userId) || !role) {
    return new NextResponse("Invalid request data", { status: 400 });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user role:", error);
    return new NextResponse("Error updating user role", { status: 500 });
  }
}
