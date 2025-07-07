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
  const workspaceId = searchParams.get('workspaceId');

  try {
    const whereClause: any = {
      OR: [
        { authorId: session.user.id },
        {
          workspace: {
            members: {
              some: {
                userId: session.user.id,
              },
            },
          },
        },
      ],
    };

    if (workspaceId) {
      whereClause.workspaceId = parseInt(workspaceId);
    }

    if (query || tags.length > 0) {
      whereClause.AND = [
        ...(whereClause.AND || []),
        {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
            ...(tags.length > 0 ? [{ tags: { hasEvery: tags } }] : []),
          ],
        },
      ];
    }

    const notes = await prisma.note.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        workspace: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
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

  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, content, type, published, imageUrls, tags, workspaceId, x, y, width, height } = body;

    // If workspaceId is provided, verify user has access to the workspace
    if (workspaceId) {
      const workspace = await prisma.workspace.findFirst({
        where: {
          id: workspaceId,
          OR: [
            { creatorId: session.user.id },
            {
              members: {
                some: {
                  userId: session.user.id,
                },
              },
            },
          ],
        },
      });

      if (!workspace) {
        return new NextResponse("Workspace not found or insufficient permissions", { status: 404 });
      }
    }

    const note = await prisma.note.create({
      data: {
        title,
        content,
        type,
        published: published || false,
        imageUrls: imageUrls || [],
        tags: tags || [],
        x: x || Math.random() * 1000,
        y: y || Math.random() * 1000,
        width: width || 300,
        height: height || 200,
        authorId: session.user.id,
        workspaceId: workspaceId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        workspace: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("Error creating note:", error);
    return new NextResponse("Error creating note", { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, title, content, type, published, imageUrls, tags, x, y, width, height } = body;

    if (!id) {
      return new NextResponse("Note ID is required", { status: 400 });
    }

    // Check if user has access to this note
    const existingNote = await prisma.note.findFirst({
      where: {
        id: id,
        OR: [
          { authorId: session.user.id },
          {
            workspace: {
              members: {
                some: {
                  userId: session.user.id,
                },
              },
            },
          },
        ],
      },
    });

    if (!existingNote) {
      return new NextResponse("Note not found or insufficient permissions", { status: 404 });
    }

    const updatedNote = await prisma.note.update({
      where: { id: id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(type !== undefined && { type }),
        ...(published !== undefined && { published }),
        ...(imageUrls !== undefined && { imageUrls }),
        ...(tags !== undefined && { tags }),
        ...(x !== undefined && { x }),
        ...(y !== undefined && { y }),
        ...(width !== undefined && { width }),
        ...(height !== undefined && { height }),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        workspace: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });
    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error("Error updating note:", error);
    return new NextResponse("Error updating note", { status: 500 });
  }
}