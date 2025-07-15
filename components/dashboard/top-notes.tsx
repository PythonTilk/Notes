'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Eye,
  Heart,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { formatCurrency, formatPercentage, getChangeColor, timeAgo } from '@/lib/utils';
import Link from 'next/link';

interface TopNote {
  id: string;
  title: string;
  content: string;
  type: 'TEXT' | 'RICH_TEXT' | 'CODE' | 'MARKDOWN';
  author: {
    name: string;
    username: string;
    image?: string;
  };
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  views: number;
  likes: number;
  comments: number;
  createdAt: Date;
  tags: string[];
}

// Mock top notes data
const topNotes: TopNote[] = [
  {
    id: '1',
    title: 'The Future of AI in Web Development',
    content: 'Exploring how artificial intelligence is revolutionizing the way we build web applications...',
    type: 'RICH_TEXT',
    author: {
      name: 'Alex Chen',
      username: 'alexdev',
    },
    price: 125.50,
    change24h: 15.2,
    volume24h: 45000,
    marketCap: 1250000,
    views: 2340,
    likes: 156,
    comments: 23,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    tags: ['AI', 'Web Development', 'Future Tech'],
  },
  {
    id: '2',
    title: 'Advanced React Patterns & Performance',
    content: 'Deep dive into advanced React patterns that will make your applications faster and more maintainable...',
    type: 'CODE',
    author: {
      name: 'Sarah Johnson',
      username: 'reactqueen',
    },
    price: 89.75,
    change24h: -3.8,
    volume24h: 32000,
    marketCap: 897500,
    views: 1890,
    likes: 234,
    comments: 45,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    tags: ['React', 'Performance', 'JavaScript'],
  },
  {
    id: '3',
    title: 'Blockchain Development Fundamentals',
    content: 'Complete guide to understanding blockchain technology and building decentralized applications...',
    type: 'MARKDOWN',
    author: {
      name: 'Mike Rodriguez',
      username: 'blockchainmike',
    },
    price: 156.20,
    change24h: 8.7,
    volume24h: 28000,
    marketCap: 1562000,
    views: 1456,
    likes: 189,
    comments: 67,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    tags: ['Blockchain', 'Web3', 'Cryptocurrency'],
  },
];

const getTypeIcon = (type: TopNote['type']) => {
  switch (type) {
    case 'CODE':
      return '{ }';
    case 'MARKDOWN':
      return 'MD';
    case 'RICH_TEXT':
      return 'RT';
    default:
      return 'T';
  }
};

const getTypeColor = (type: TopNote['type']) => {
  switch (type) {
    case 'CODE':
      return 'bg-neon-green/20 text-neon-green border-neon-green/30';
    case 'MARKDOWN':
      return 'bg-neon-blue/20 text-neon-blue border-neon-blue/30';
    case 'RICH_TEXT':
      return 'bg-neon-purple/20 text-neon-purple border-neon-purple/30';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

export function TopNotes() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Trending Notes
        </CardTitle>
        <Button asChild variant="outline" size="sm">
          <Link href="/notes">
            View All
            <ExternalLink className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topNotes.map((note) => (
            <div
              key={note.id}
              className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-8 h-8 rounded-md border flex items-center justify-center text-xs font-bold ${getTypeColor(note.type)}`}>
                    {getTypeIcon(note.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1 truncate">
                      {note.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {note.content}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">
                        by @{note.author.username}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {timeAgo(note.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Price Info */}
                <div className="text-right ml-4">
                  <p className="font-mono font-semibold">
                    {formatCurrency(note.price)}
                  </p>
                  <p className={`text-sm font-mono ${getChangeColor(note.change24h)}`}>
                    <span className="inline-flex items-center gap-1">
                      {note.change24h > 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {formatPercentage(note.change24h)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {note.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {note.views.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {note.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {note.comments}
                  </span>
                </div>
                
                <div className="text-right text-sm text-muted-foreground">
                  <p>Vol: {formatCurrency(note.volume24h)}</p>
                  <p>MCap: {formatCurrency(note.marketCap)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}