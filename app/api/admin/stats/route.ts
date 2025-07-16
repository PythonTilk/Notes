import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function checkAdminAccess(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return user?.role === 'ADMIN';
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await checkAdminAccess(session.user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get user statistics
    const [
      totalUsers,
      activeUsers,
      onlineUsers,
      newUsersToday,
      totalWorkspaces,
      activeWorkspaces,
      totalNotes,
      notesToday,
      totalFiles,
      totalFileSize,
      totalMessages,
      messagesToday,
    ] = await Promise.all([
      // Users
      prisma.user.count(),
      prisma.user.count({
        where: {
          isActive: true,
        },
      }),
      prisma.user.count({
        where: {
          isOnline: true,
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      }),

      // Workspaces
      prisma.workspace.count(),
      prisma.workspace.count({
        where: {
          isActive: true,
        },
      }),

      // Notes
      prisma.note.count({
        where: {
          deletedAt: null,
        },
      }),
      prisma.note.count({
        where: {
          deletedAt: null,
          createdAt: {
            gte: today,
          },
        },
      }),

      // Files
      prisma.file.count(),
      prisma.file.aggregate({
        _sum: {
          size: true,
        },
      }),

      // Chat messages
      prisma.chatMessage.count(),
      prisma.chatMessage.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      }),
    ]);

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        online: onlineUsers,
        newToday: newUsersToday,
      },
      workspaces: {
        total: totalWorkspaces,
        active: activeWorkspaces,
      },
      notes: {
        total: totalNotes,
        createdToday: notesToday,
      },
      files: {
        total: totalFiles,
        totalSize: totalFileSize._sum.size || 0,
      },
      chat: {
        messagesTotal: totalMessages,
        messagesToday: messagesToday,
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}