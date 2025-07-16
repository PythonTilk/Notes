import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createConnectionSchema = z.object({
  fromId: z.string(),
  toId: z.string(),
  label: z.string().optional(),
  color: z.string().default('#6b7280'),
  style: z.enum(['SOLID', 'DASHED', 'DOTTED']).default('SOLID'),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = params.id;

    // Check if user has access to workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        OR: [
          { ownerId: session.user.id },
          { 
            members: {
              some: { userId: session.user.id }
            }
          },
          { isPublic: true }
        ]
      }
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Get all connections for notes in this workspace
    const connections = await prisma.noteConnection.findMany({
      where: {
        fromNote: {
          workspaceId: workspaceId
        }
      },
      include: {
        fromNote: {
          select: {
            id: true,
            title: true,
            workspaceId: true
          }
        },
        toNote: {
          select: {
            id: true,
            title: true,
            workspaceId: true
          }
        }
      }
    });

    return NextResponse.json({ connections });
  } catch (error) {
    console.error('Error fetching connections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connections' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = params.id;
    const body = await request.json();
    const validatedData = createConnectionSchema.parse(body);

    // Check if user has edit access to workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        OR: [
          { ownerId: session.user.id },
          { 
            members: {
              some: { 
                userId: session.user.id,
                role: { in: ['OWNER', 'ADMIN', 'MEMBER'] }
              }
            }
          }
        ]
      }
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found or no access' }, { status: 404 });
    }

    // Verify both notes exist and belong to this workspace
    const [fromNote, toNote] = await Promise.all([
      prisma.note.findFirst({
        where: {
          id: validatedData.fromId,
          workspaceId: workspaceId,
          isDeleted: false
        }
      }),
      prisma.note.findFirst({
        where: {
          id: validatedData.toId,
          workspaceId: workspaceId,
          isDeleted: false
        }
      })
    ]);

    if (!fromNote || !toNote) {
      return NextResponse.json({ error: 'One or both notes not found' }, { status: 404 });
    }

    // Check if connection already exists
    const existingConnection = await prisma.noteConnection.findFirst({
      where: {
        fromId: validatedData.fromId,
        toId: validatedData.toId
      }
    });

    if (existingConnection) {
      return NextResponse.json({ error: 'Connection already exists' }, { status: 409 });
    }

    // Create the connection
    const connection = await prisma.noteConnection.create({
      data: {
        fromId: validatedData.fromId,
        toId: validatedData.toId,
        label: validatedData.label,
        color: validatedData.color,
        style: validatedData.style,
      },
      include: {
        fromNote: {
          select: {
            id: true,
            title: true,
            workspaceId: true
          }
        },
        toNote: {
          select: {
            id: true,
            title: true,
            workspaceId: true
          }
        }
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'NOTE_UPDATED',
        title: 'Note connection created',
        description: `Connected "${fromNote.title}" to "${toNote.title}"`,
        userId: session.user.id,
        workspaceId: workspaceId,
        metadata: {
          connectionId: connection.id,
          fromNoteId: validatedData.fromId,
          toNoteId: validatedData.toId,
        }
      }
    });

    return NextResponse.json({ connection }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating connection:', error);
    return NextResponse.json(
      { error: 'Failed to create connection' },
      { status: 500 }
    );
  }
}