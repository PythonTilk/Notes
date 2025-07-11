import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const noteId = parseInt(params.noteId);
    const note = await prisma.note.findUnique({
      where: { id: noteId, authorId: parseInt(session.user.id as string) },
    });

    if (!note) {
      return NextResponse.json({ message: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error("Error fetching note:", error);
    return NextResponse.json(
      { message: "Something went wrong", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const noteId = parseInt(params.noteId);
    const { title, content } = await request.json();

    const updatedNote = await prisma.note.update({
      where: { id: noteId, authorId: parseInt(session.user.id as string) },
      data: { title, content },
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json(
      { message: "Something went wrong", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const noteId = parseInt(params.noteId);

    await prisma.note.delete({
      where: { id: noteId, authorId: parseInt(session.user.id as string) },
    });

    return NextResponse.json({ message: "Note deleted successfully" }, { status: 204 });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { message: "Something went wrong", error: (error as Error).message },
      { status: 500 }
    );
  }
}
