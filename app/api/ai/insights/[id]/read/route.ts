import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const insightId = params.id;

    // Find the insight and verify ownership
    const insight = await prisma.aIInsight.findFirst({
      where: {
        id: insightId,
        userId: session.user.id
      }
    });

    if (!insight) {
      return NextResponse.json({ error: 'Insight not found' }, { status: 404 });
    }

    // Mark as read
    const updatedInsight = await prisma.aIInsight.update({
      where: { id: insightId },
      data: { isRead: true }
    });

    return NextResponse.json({ insight: updatedInsight });
  } catch (error) {
    console.error('Error marking AI insight as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark insight as read' },
      { status: 500 }
    );
  }
}