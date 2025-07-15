'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  TrendingUp, 
  Award, 
  Edit, 
  Trash2,
  Clock
} from 'lucide-react';
import { timeAgo } from '@/lib/utils';

interface RecentActivityProps {
  userId: string;
}

interface Activity {
  id: string;
  type: 'NOTE_CREATED' | 'NOTE_UPDATED' | 'NOTE_DELETED' | 'TRADE_EXECUTED' | 'LEVEL_UP' | 'ACHIEVEMENT_UNLOCKED';
  title: string;
  description: string;
  timestamp: Date;
  metadata?: any;
}

// Mock activities - in real app this would come from API
const activities: Activity[] = [
  {
    id: '1',
    type: 'TRADE_EXECUTED',
    title: 'Bought AI Revolution Notes',
    description: 'Purchased 50 shares at $125.50',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
  },
  {
    id: '2',
    type: 'NOTE_CREATED',
    title: 'Created new note',
    description: 'Web3 Development Best Practices',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
  },
  {
    id: '3',
    type: 'LEVEL_UP',
    title: 'Level Up!',
    description: 'Reached level 7 - Keep trading!',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: '4',
    type: 'TRADE_EXECUTED',
    title: 'Sold Crypto Trading Guide',
    description: 'Sold 25 shares at $89.25 (+12.5%)',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
  },
  {
    id: '5',
    type: 'NOTE_UPDATED',
    title: 'Updated note',
    description: 'React Best Practices - Added new section',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
  },
];

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'NOTE_CREATED':
      return <FileText className="w-4 h-4" />;
    case 'NOTE_UPDATED':
      return <Edit className="w-4 h-4" />;
    case 'NOTE_DELETED':
      return <Trash2 className="w-4 h-4" />;
    case 'TRADE_EXECUTED':
      return <TrendingUp className="w-4 h-4" />;
    case 'LEVEL_UP':
      return <Award className="w-4 h-4" />;
    case 'ACHIEVEMENT_UNLOCKED':
      return <Award className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

const getActivityColor = (type: Activity['type']) => {
  switch (type) {
    case 'NOTE_CREATED':
      return 'text-neon-blue';
    case 'NOTE_UPDATED':
      return 'text-neon-yellow';
    case 'NOTE_DELETED':
      return 'text-trading-down';
    case 'TRADE_EXECUTED':
      return 'text-neon-green';
    case 'LEVEL_UP':
      return 'text-neon-purple';
    case 'ACHIEVEMENT_UNLOCKED':
      return 'text-neon-purple';
    default:
      return 'text-muted-foreground';
  }
};

const getActivityBadge = (type: Activity['type']) => {
  switch (type) {
    case 'NOTE_CREATED':
      return <Badge variant="neon">Created</Badge>;
    case 'NOTE_UPDATED':
      return <Badge variant="secondary">Updated</Badge>;
    case 'NOTE_DELETED':
      return <Badge variant="destructive">Deleted</Badge>;
    case 'TRADE_EXECUTED':
      return <Badge variant="trading">Trade</Badge>;
    case 'LEVEL_UP':
      return <Badge variant="neon">Level Up</Badge>;
    case 'ACHIEVEMENT_UNLOCKED':
      return <Badge variant="neon">Achievement</Badge>;
    default:
      return <Badge variant="outline">Activity</Badge>;
  }
};

export function RecentActivity({ userId }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto scrollbar-thin">
          {activities.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="space-y-1">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="p-3 hover:bg-accent/50 transition-colors border-b border-border/50 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium truncate">
                          {activity.title}
                        </p>
                        {getActivityBadge(activity.type)}
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {timeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}