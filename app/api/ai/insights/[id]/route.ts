import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
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

    // Delete the insight
    await prisma.aIInsight.delete({
      where: { id: insightId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting AI insight:', error);
    return NextResponse.json(
      { error: 'Failed to delete insight' },
      { status: 500 }
    );
  }
}