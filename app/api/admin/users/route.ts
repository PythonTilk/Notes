import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { headers } from 'next/headers';

const updateUserRoleSchema = z.object({
  userId: z.string().cuid(),
  role: z.enum(['USER', 'MODERATOR', 'ADMIN']),
});

async function checkAdminAccess(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return user?.role === 'ADMIN';
}

async function checkModeratorAccess(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return user?.role === 'ADMIN' || user?.role === 'MODERATOR';
}

async function logAuditAction(
  userId: string,
  action: string,
  resource: string,
  resourceId?: string,
  details?: any,
  request?: NextRequest
) {
  const headersList = headers();
  const ipAddress = headersList.get('x-forwarded-for') || 
                   headersList.get('x-real-ip') || 
                   'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';

  await prisma.auditLog.create({
    data: {
      userId,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent,
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isModerator = await checkModeratorAccess(session.user.id);
    if (!isModerator) {
      await logAuditAction(
        session.user.id,
        'UNAUTHORIZED_ACCESS_ATTEMPT',
        'users',
        undefined,
        { endpoint: '/api/admin/users' },
        request
      );
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const role = searchParams.get('role');

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          image: true,
          role: true,
          isActive: true,
          isOnline: true,
          lastSeen: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              ownedWorkspaces: true,
              workspaceMembers: true,
              notes: true,
              files: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
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

    const isAdmin = await checkAdminAccess(session.user.id);
    if (!isAdmin) {
      await logAuditAction(
        session.user.id,
        'UNAUTHORIZED_ACCESS_ATTEMPT',
        'users',
        undefined,
        { endpoint: '/api/admin/users', method: 'PUT' },
        request
      );
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateUserRoleSchema.parse(body);

    // Prevent self-role modification
    if (validatedData.userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot modify your own role' },
        { status: 400 }
      );
    }

    // Get current user data
    const targetUser = await prisma.user.findUnique({
      where: { id: validatedData.userId },
      select: { id: true, username: true, email: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: validatedData.userId },
      data: { role: validatedData.role },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        image: true,
        role: true,
        isActive: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    // Log the role change
    await logAuditAction(
      session.user.id,
      'USER_ROLE_CHANGED',
      'users',
      validatedData.userId,
      {
        previousRole: targetUser.role,
        newRole: validatedData.role,
        targetUser: {
          username: targetUser.username,
          email: targetUser.email,
        },
      },
      request
    );

    // Create activity
    await prisma.activity.create({
      data: {
        type: 'USER_ROLE_CHANGED',
        title: 'User Role Changed',
        description: `Changed ${targetUser.username}'s role from ${targetUser.role} to ${validatedData.role}`,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}