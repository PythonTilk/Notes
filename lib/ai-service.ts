import { prisma } from '@/lib/prisma';

export interface AIConfig {
  provider: 'openai' | 'anthropic' | 'local';
  apiKey?: string;
  model?: string;
  maxTokens?: number;
}

export interface SummaryResult {
  summary: string;
  keyPoints: string[];
  confidence: number;
}

export interface SuggestionResult {
  suggestions: {
    type: 'improvement' | 'connection' | 'tag' | 'structure';
    title: string;
    description: string;
    confidence: number;
  }[];
}

export interface PatternResult {
  patterns: {
    type: 'duplicate' | 'related' | 'sequence' | 'category';
    items: string[];
    description: string;
    confidence: number;
  }[];
}

class AIService {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  async summarizeText(text: string, maxLength: number = 200): Promise<SummaryResult> {
    try {
      if (this.config.provider === 'local') {
        return this.localSummarize(text, maxLength);
      }

      // For now, implement a simple local summarization
      // In production, you would integrate with OpenAI, Anthropic, etc.
      return this.localSummarize(text, maxLength);
    } catch (error) {
      console.error('Error summarizing text:', error);
      return {
        summary: text.substring(0, maxLength) + (text.length > maxLength ? '...' : ''),
        keyPoints: [],
        confidence: 0.3
      };
    }
  }

  async generateSuggestions(notes: any[], currentNote?: any): Promise<SuggestionResult> {
    try {
      const suggestions: SuggestionResult['suggestions'] = [];

      // Analyze current note for improvements
      if (currentNote) {
        const improvementSuggestions = this.analyzeNoteForImprovements(currentNote);
        suggestions.push(...improvementSuggestions);
      }

      // Find potential connections
      const connectionSuggestions = this.findPotentialConnections(notes, currentNote);
      suggestions.push(...connectionSuggestions);

      // Suggest tags
      const tagSuggestions = this.suggestTags(notes, currentNote);
      suggestions.push(...tagSuggestions);

      return { suggestions };
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return { suggestions: [] };
    }
  }

  async findPatterns(notes: any[]): Promise<PatternResult> {
    try {
      const patterns: PatternResult['patterns'] = [];

      // Find duplicates
      const duplicates = this.findDuplicateContent(notes);
      if (duplicates.length > 0) {
        patterns.push({
          type: 'duplicate',
          items: duplicates,
          description: 'Found notes with similar content',
          confidence: 0.8
        });
      }

      // Find related notes
      const related = this.findRelatedNotes(notes);
      patterns.push(...related);

      // Find sequences
      const sequences = this.findSequentialNotes(notes);
      patterns.push(...sequences);

      return { patterns };
    } catch (error) {
      console.error('Error finding patterns:', error);
      return { patterns: [] };
    }
  }

  private localSummarize(text: string, maxLength: number): SummaryResult {
    // Simple extractive summarization
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length <= 2) {
      return {
        summary: text,
        keyPoints: sentences.map(s => s.trim()),
        confidence: 0.9
      };
    }

    // Score sentences by word frequency and position
    const wordFreq = this.calculateWordFrequency(text);
    const scoredSentences = sentences.map((sentence, index) => {
      const words = sentence.toLowerCase().split(/\s+/);
      const score = words.reduce((sum, word) => sum + (wordFreq[word] || 0), 0) / words.length;
      const positionScore = index === 0 ? 1.5 : (index === sentences.length - 1 ? 1.2 : 1.0);
      
      return {
        sentence: sentence.trim(),
        score: score * positionScore,
        index
      };
    });

    // Select top sentences
    const topSentences = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.min(3, sentences.length))
      .sort((a, b) => a.index - b.index);

    const summary = topSentences.map(s => s.sentence).join('. ');
    const keyPoints = topSentences.slice(0, 5).map(s => s.sentence);

    return {
      summary: summary.length > maxLength ? summary.substring(0, maxLength) + '...' : summary,
      keyPoints,
      confidence: 0.7
    };
  }

  private calculateWordFrequency(text: string): Record<string, number> {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those']);
    
    const freq: Record<string, number> = {};
    words.forEach(word => {
      if (!stopWords.has(word) && word.length > 2) {
        freq[word] = (freq[word] || 0) + 1;
      }
    });

    return freq;
  }

  private analyzeNoteForImprovements(note: any): SuggestionResult['suggestions'] {
    const suggestions: SuggestionResult['suggestions'] = [];

    // Check for very short content
    if (note.content.length < 50) {
      suggestions.push({
        type: 'improvement',
        title: 'Expand content',
        description: 'This note seems quite brief. Consider adding more details or context.',
        confidence: 0.6
      });
    }

    // Check for very long content without structure
    if (note.content.length > 1000 && !note.content.includes('\n') && !note.content.includes('•')) {
      suggestions.push({
        type: 'structure',
        title: 'Add structure',
        description: 'Consider breaking this long note into sections or bullet points for better readability.',
        confidence: 0.7
      });
    }

    // Check for missing title
    if (!note.title || note.title.trim().length < 3) {
      suggestions.push({
        type: 'improvement',
        title: 'Add descriptive title',
        description: 'A clear title will help you find and organize this note better.',
        confidence: 0.8
      });
    }

    return suggestions;
  }

  private findPotentialConnections(notes: any[], currentNote?: any): SuggestionResult['suggestions'] {
    if (!currentNote || notes.length < 2) return [];

    const suggestions: SuggestionResult['suggestions'] = [];
    const currentWords = this.extractKeywords(currentNote.content + ' ' + currentNote.title);

    notes.forEach(note => {
      if (note.id === currentNote.id) return;

      const noteWords = this.extractKeywords(note.content + ' ' + note.title);
      const commonWords = currentWords.filter(word => noteWords.includes(word));

      if (commonWords.length >= 2) {
        suggestions.push({
          type: 'connection',
          title: `Connect to "${note.title}"`,
          description: `These notes share common topics: ${commonWords.slice(0, 3).join(', ')}`,
          confidence: Math.min(0.9, commonWords.length * 0.2)
        });
      }
    });

    return suggestions.slice(0, 3); // Limit to top 3 suggestions
  }

  private suggestTags(notes: any[], currentNote?: any): SuggestionResult['suggestions'] {
    if (!currentNote) return [];

    const suggestions: SuggestionResult['suggestions'] = [];
    const keywords = this.extractKeywords(currentNote.content + ' ' + currentNote.title);
    
    // Extract existing tags from other notes
    const existingTags = notes
      .filter(note => note.tag && note.id !== currentNote.id)
      .map(note => note.tag.toLowerCase());

    // Suggest existing tags that match keywords
    keywords.forEach(keyword => {
      const matchingTag = existingTags.find(tag => 
        tag.includes(keyword) || keyword.includes(tag)
      );
      
      if (matchingTag && !suggestions.find(s => s.description.includes(matchingTag))) {
        suggestions.push({
          type: 'tag',
          title: `Add tag: ${matchingTag}`,
          description: `This note seems related to the "${matchingTag}" category`,
          confidence: 0.6
        });
      }
    });

    // Suggest new tags based on content
    const topKeywords = keywords.slice(0, 3);
    topKeywords.forEach(keyword => {
      if (!existingTags.includes(keyword)) {
        suggestions.push({
          type: 'tag',
          title: `Add tag: ${keyword}`,
          description: `"${keyword}" appears to be a key topic in this note`,
          confidence: 0.5
        });
      }
    });

    return suggestions.slice(0, 2);
  }

  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those']);
    
    const freq: Record<string, number> = {};
    words.forEach(word => {
      if (!stopWords.has(word) && word.length > 2) {
        freq[word] = (freq[word] || 0) + 1;
      }
    });

    return Object.entries(freq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  private findDuplicateContent(notes: any[]): string[] {
    const duplicates: string[] = [];
    const seen = new Map<string, string>();

    notes.forEach(note => {
      const normalized = note.content.toLowerCase().replace(/\s+/g, ' ').trim();
      if (normalized.length < 20) return; // Skip very short notes

      const similar = Array.from(seen.entries()).find(([content, id]) => {
        const similarity = this.calculateSimilarity(normalized, content);
        return similarity > 0.8 && id !== note.id;
      });

      if (similar) {
        duplicates.push(note.title || note.id);
      } else {
        seen.set(normalized, note.id);
      }
    });

    return duplicates;
  }

  private findRelatedNotes(notes: any[]): PatternResult['patterns'] {
    const patterns: PatternResult['patterns'] = [];
    const groups = new Map<string, string[]>();

    notes.forEach(note => {
      const keywords = this.extractKeywords(note.content + ' ' + note.title);
      keywords.slice(0, 3).forEach(keyword => {
        if (!groups.has(keyword)) {
          groups.set(keyword, []);
        }
        groups.get(keyword)!.push(note.title || note.id);
      });
    });

    groups.forEach((noteIds, keyword) => {
      if (noteIds.length >= 3) {
        patterns.push({
          type: 'related',
          items: noteIds.slice(0, 5),
          description: `Notes related to "${keyword}"`,
          confidence: 0.6
        });
      }
    });

    return patterns.slice(0, 3);
  }

  private findSequentialNotes(notes: any[]): PatternResult['patterns'] {
    const patterns: PatternResult['patterns'] = [];
    
    // Look for numbered sequences
    const numberedNotes = notes.filter(note => 
      /\b(step|part|chapter|section)\s*\d+/i.test(note.title) ||
      /^\d+[\.\)]\s/.test(note.title)
    );

    if (numberedNotes.length >= 3) {
      patterns.push({
        type: 'sequence',
        items: numberedNotes.map(note => note.title).slice(0, 5),
        description: 'Found a sequence of numbered notes',
        confidence: 0.8
      });
    }

    return patterns;
  }

  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.split(/\s+/));
    const words2 = new Set(text2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }
}

// Singleton instance
let aiService: AIService | null = null;

export const getAIService = (): AIService => {
  if (!aiService) {
    aiService = new AIService({
      provider: 'local', // Default to local processing
      maxTokens: 1000
    });
  }
  return aiService;
};

// Helper functions for database operations
export const saveAIInsight = async (
  type: 'SUMMARY' | 'SUGGESTION' | 'PATTERN' | 'DUPLICATE' | 'IMPROVEMENT' | 'RELATIONSHIP',
  title: string,
  content: string,
  userId: string,
  confidence: number = 0.5,
  workspaceId?: string,
  noteId?: string,
  metadata?: any
) => {
  return await prisma.aIInsight.create({
    data: {
      type,
      title,
      content,
      confidence,
      metadata,
      userId,
      workspaceId,
      noteId,
    }
  });
};

export const getAIInsights = async (userId: string, workspaceId?: string, limit: number = 10) => {
  return await prisma.aIInsight.findMany({
    where: {
      userId,
      workspaceId,
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit,
    include: {
      note: {
        select: {
          id: true,
          title: true
        }
      },
      workspace: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
};