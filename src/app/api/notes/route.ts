import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';
  const tags = searchParams.get('tags') ? searchParams.get('tags')?.split(',') : [];

  try {
    const notes = await prisma.note.findMany({
      where: {
        authorId: session.user.id,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { tags: { hasEvery: tags } },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return new NextResponse("Error fetching notes", { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const { title, content, type, published, imageUrls, tags } = body;

  const note = await prisma.note.create({
    data: {
      title,
      content,
      type,
      published: published || false, // Default to false if not provided
      imageUrls: imageUrls || [],
      tags: tags || [],
      // @ts-ignore
      authorId: session.user.id,
    },
  });

  return NextResponse.json(note);
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const { id, title, content, type, published, imageUrls, tags } = body;

  if (!id) {
    return new NextResponse("Note ID is required", { status: 400 });
  }

  try {
    const updatedNote = await prisma.note.update({
      where: { id: id, authorId: session.user.id }, // Ensure user owns the note
      data: {
        title,
        content,
        type,
        published,
        imageUrls: imageUrls || [],
        tags: tags || [],
      },
    });
    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error("Error updating note:", error);
    return new NextResponse("Error updating note", { status: 500 });
  }
}