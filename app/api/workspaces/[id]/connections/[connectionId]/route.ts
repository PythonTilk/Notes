import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateConnectionSchema = z.object({
  label: z.string().optional(),
  color: z.string().optional(),
  style: z.enum(['SOLID', 'DASHED', 'DOTTED']).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; connectionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = params.id;
    const connectionId = params.connectionId;
    const body = await request.json();
    const validatedData = updateConnectionSchema.parse(body);

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

    // Find the connection and verify it belongs to this workspace
    const existingConnection = await prisma.noteConnection.findFirst({
      where: {
        id: connectionId,
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

    if (!existingConnection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    // Update the connection
    const connection = await prisma.noteConnection.update({
      where: { id: connectionId },
      data: validatedData,
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
        title: 'Note connection updated',
        description: `Updated connection between "${existingConnection.fromNote.title}" and "${existingConnection.toNote.title}"`,
        userId: session.user.id,
        workspaceId: workspaceId,
        metadata: {
          connectionId: connection.id,
          updates: validatedData,
        }
      }
    });

    return NextResponse.json({ connection });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating connection:', error);
    return NextResponse.json(
      { error: 'Failed to update connection' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; connectionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = params.id;
    const connectionId = params.connectionId;

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

    // Find the connection and verify it belongs to this workspace
    const existingConnection = await prisma.noteConnection.findFirst({
      where: {
        id: connectionId,
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

    if (!existingConnection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    // Delete the connection
    await prisma.noteConnection.delete({
      where: { id: connectionId }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'NOTE_UPDATED',
        title: 'Note connection deleted',
        description: `Deleted connection between "${existingConnection.fromNote.title}" and "${existingConnection.toNote.title}"`,
        userId: session.user.id,
        workspaceId: workspaceId,
        metadata: {
          connectionId: connectionId,
          fromNoteId: existingConnection.fromId,
          toNoteId: existingConnection.toId,
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting connection:', error);
    return NextResponse.json(
      { error: 'Failed to delete connection' },
      { status: 500 }
    );
  }
}