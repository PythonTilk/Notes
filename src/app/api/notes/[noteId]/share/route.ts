
import { getServerSession } from "next-auth";
import { authOptions } from "../../../api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: Request, { params }: { params: { noteId: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const noteId = parseInt(params.noteId);
  const { userIds } = await request.json(); // Array of user IDs to share with

  if (isNaN(noteId) || !Array.isArray(userIds)) {
    return new NextResponse("Invalid request data", { status: 400 });
  }

  try {
    // Verify the note belongs to the authenticated user
    const note = await prisma.note.findUnique({
      where: { id: noteId, authorId: session.user.id },
    });

    if (!note) {
      return new NextResponse("Note not found or unauthorized", { status: 404 });
    }

    // Clear existing shares for this note (optional, depending on desired behavior)
    await prisma.noteShare.deleteMany({
      where: { noteId: noteId },
    });

    // Create new shares
    const newShares = userIds.map((userId: number) => ({
      noteId: noteId,
      userId: userId,
    }));

    await prisma.noteShare.createMany({
      data: newShares,
      skipDuplicates: true, // Avoid creating duplicate entries if a user is already shared
    });

    return NextResponse.json({ message: "Note shared successfully" });
  } catch (error) {
    console.error("Error sharing note:", error);
    return new NextResponse("Error sharing note", { status: 500 });
  }
}
