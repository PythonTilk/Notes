import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAIService, saveAIInsight } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId, noteId } = await request.json();

    // Get notes for analysis
    const notes = await prisma.note.findMany({
      where: {
        workspaceId: workspaceId || undefined,
        id: noteId || undefined,
        isDeleted: false,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
          }
        }
      }
    });

    if (notes.length === 0) {
      return NextResponse.json({ error: 'No notes found' }, { status: 404 });
    }

    const aiService = getAIService();
    const insights: any[] = [];
    const suggestions: any[] = [];

    // Generate insights for each note
    for (const note of notes) {
      // Generate summary
      const summary = await aiService.summarizeText(note.content);
      if (summary.summary !== note.content) {
        const summaryInsight = await saveAIInsight(
          'SUMMARY',
          `Summary for "${note.title}"`,
          summary.summary,
          session.user.id,
          summary.confidence,
          workspaceId,
          note.id,
          { keyPoints: summary.keyPoints }
        );
        insights.push(summaryInsight);
      }
    }

    // Generate suggestions
    const currentNote = noteId ? notes.find(n => n.id === noteId) : notes[0];
    const suggestionResults = await aiService.generateSuggestions(notes, currentNote);
    suggestions.push(...suggestionResults.suggestions);

    // Save improvement suggestions as insights
    for (const suggestion of suggestionResults.suggestions) {
      if (suggestion.type === 'improvement') {
        const improvementInsight = await saveAIInsight(
          'IMPROVEMENT',
          suggestion.title,
          suggestion.description,
          session.user.id,
          suggestion.confidence,
          workspaceId,
          currentNote?.id,
          { suggestionType: suggestion.type }
        );
        insights.push(improvementInsight);
      }
    }

    // Find patterns
    const patterns = await aiService.findPatterns(notes);
    for (const pattern of patterns.patterns) {
      const patternInsight = await saveAIInsight(
        pattern.type === 'duplicate' ? 'DUPLICATE' : 'PATTERN',
        `Pattern: ${pattern.description}`,
        `Found ${pattern.items.length} items: ${pattern.items.slice(0, 3).join(', ')}${pattern.items.length > 3 ? '...' : ''}`,
        session.user.id,
        pattern.confidence,
        workspaceId,
        undefined,
        { items: pattern.items, patternType: pattern.type }
      );
      insights.push(patternInsight);
    }

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'NOTE_UPDATED',
        title: 'AI insights generated',
        description: `Generated ${insights.length} insights and ${suggestions.length} suggestions`,
        userId: session.user.id,
        workspaceId: workspaceId || null,
        metadata: {
          insightsCount: insights.length,
          suggestionsCount: suggestions.length,
        }
      }
    });

    return NextResponse.json({ insights, suggestions });
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}