
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const { name, biography, avatar } = body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        biography,
        avatar,
      },
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    return new NextResponse("Error updating profile", { status: 500 });
  }
}
