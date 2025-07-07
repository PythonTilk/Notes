
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function DELETE(request: Request, { params }: { params: { email: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'ADMIN') {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const { email } = params;

  if (!email) {
    return new NextResponse("Email is required", { status: 400 });
  }

  try {
    await prisma.bannedEmail.delete({
      where: { email: email },
    });
    return new NextResponse("Email unbanned successfully", { status: 200 });
  } catch (error) {
    console.error("Error unbanning email:", error);
    return new NextResponse("Error unbanning email", { status: 500 });
  }
}
