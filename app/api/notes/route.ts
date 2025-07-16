import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createNoteSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  type: z.enum(['TEXT', 'RICH_TEXT', 'CODE', 'MARKDOWN']).optional(),
  color: z.string().optional(),
  tag: z.string().optional(),
  workspaceId: z.string().cuid(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

const updateNoteSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  type: z.enum(['TEXT', 'RICH_TEXT', 'CODE', 'MARKDOWN']).optional(),
  color: z.string().optional(),
  tag: z.string().optional(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const includeDeleted = searchParams.get('includeDeleted') === 'true';

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
    }

    // Check if user has access to workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        OR: [
          { ownerId: session.user.id },
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
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    const notes = await prisma.note.findMany({
      where: {
        workspaceId,
        isDeleted: includeDeleted ? undefined : false,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createNoteSchema.parse(body);

    // Check if user has access to workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: validatedData.workspaceId,
        OR: [
          { ownerId: session.user.id },
          {
            members: {
              some: {
                userId: session.user.id,
                role: { in: ['OWNER', 'ADMIN', 'MEMBER'] },
              },
            },
          },
        ],
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    const note = await prisma.note.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        type: validatedData.type || 'TEXT',
        color: validatedData.color || '#fbbf24',
        tag: validatedData.tag,
        positionX: validatedData.positionX || 0,
        positionY: validatedData.positionY || 0,
        width: validatedData.width || 300,
        height: validatedData.height || 200,
        authorId: session.user.id,
        workspaceId: validatedData.workspaceId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Create activity
    await prisma.activity.create({
      data: {
        type: 'NOTE_CREATED',
        title: 'Note Created',
        description: `Created note "${note.title}"`,
        userId: session.user.id,
        workspaceId: validatedData.workspaceId,
      },
    });

    return NextResponse.json({ note });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateNoteSchema.parse(body);

    // Check if user owns the note or has workspace access
    const existingNote = await prisma.note.findFirst({
      where: {
        id: validatedData.id,
        workspace: {
          OR: [
            { ownerId: session.user.id },
            {
              members: {
                some: {
                  userId: session.user.id,
                  role: { in: ['OWNER', 'ADMIN', 'MEMBER'] },
                },
              },
            },
          ],
        },
      },
      include: {
        workspace: true,
      },
    });

    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    const note = await prisma.note.update({
      where: { id: validatedData.id },
      data: {
        ...(validatedData.title && { title: validatedData.title }),
        ...(validatedData.content && { content: validatedData.content }),
        ...(validatedData.type && { type: validatedData.type }),
        ...(validatedData.color && { color: validatedData.color }),
        ...(validatedData.tag !== undefined && { tag: validatedData.tag }),
        ...(validatedData.positionX !== undefined && { positionX: validatedData.positionX }),
        ...(validatedData.positionY !== undefined && { positionY: validatedData.positionY }),
        ...(validatedData.width !== undefined && { width: validatedData.width }),
        ...(validatedData.height !== undefined && { height: validatedData.height }),
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Create activity
    await prisma.activity.create({
      data: {
        type: 'NOTE_UPDATED',
        title: 'Note Updated',
        description: `Updated note "${note.title}"`,
        userId: session.user.id,
        workspaceId: existingNote.workspaceId,
      },
    });

    return NextResponse.json({ note });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating note:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}