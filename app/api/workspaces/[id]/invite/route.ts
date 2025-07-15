import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['MEMBER', 'ADMIN']),
});

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
    const validatedData = inviteSchema.parse(body);

    // Check if user has permission to invite
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: session.user.id,
        role: { in: ['OWNER', 'ADMIN'] },
      },
      include: {
        workspace: true,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Find user by email
    const targetUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found with this email' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: targetUser.id,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this workspace' },
        { status: 400 }
      );
    }

    // Add user to workspace
    const newMember = await prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId: targetUser.id,
        role: validatedData.role,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
            role: true,
            isOnline: true,
          },
        },
      },
    });

    // Create activity
    await prisma.activity.create({
      data: {
        type: 'USER_INVITED',
        title: 'User Invited',
        description: `${targetUser.username} was invited to ${membership.workspace.name}`,
        userId: session.user.id,
        workspaceId,
      },
    });

    // TODO: Send email notification to invited user
    // This would typically integrate with an email service like SendGrid, Resend, etc.

    return NextResponse.json({ member: newMember });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error inviting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}