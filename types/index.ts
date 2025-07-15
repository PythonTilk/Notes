import { User, Note, Trade, Portfolio, Activity, Notification } from '@prisma/client';

export type UserWithRelations = User & {
  notes: Note[];
  trades: Trade[];
  portfolios: Portfolio[];
  activities: Activity[];
  notifications: Notification[];
};

export type NoteWithAuthor = Note & {
  author: User;
};

export type TradeWithUser = Trade & {
  user: User;
};

export type PortfolioWithNote = Portfolio & {
  note: Note;
};

export interface DashboardStats {
  totalUsers: number;
  totalNotes: number;
  totalTrades: number;
  totalVolume: number;
  activeUsers: number;
  topNotes: NoteWithAuthor[];
  recentTrades: TradeWithUser[];
  userGrowth: { date: string; users: number }[];
  volumeData: { date: string; volume: number }[];
}

export interface MarketData {
  notes: (Note & { 
    author: User;
    currentPrice: number;
    priceChange24h: number;
    volume24h: number;
    marketCap: number;
  })[];
  totalMarketCap: number;
  totalVolume24h: number;
  topGainers: Note[];
  topLosers: Note[];
}

export interface LiveTrade {
  id: string;
  type: 'BUY' | 'SELL';
  noteTitle: string;
  amount: number;
  price: number;
  username: string;
  timestamp: Date;
}

export interface UserStats {
  balance: number;
  totalEarnings: number;
  totalLosses: number;
  netProfit: number;
  level: number;
  experience: number;
  rank: number;
  portfolioValue: number;
  totalTrades: number;
  winRate: number;
}

export interface AdminUser extends User {
  _count: {
    notes: number;
    trades: number;
  };
  lastActivity?: Date;
}

export interface SystemMetrics {
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
  requestsPerMinute: number;
  errorRate: number;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  tradeAlerts: boolean;
  systemUpdates: boolean;
  marketingEmails: boolean;
}

export interface CreateNoteData {
  title: string;
  content: string;
  type: 'TEXT' | 'RICH_TEXT' | 'CODE' | 'MARKDOWN';
  visibility: 'PRIVATE' | 'PUBLIC' | 'SHARED';
  tags: string[];
  color?: string;
}

export interface UpdateNoteData extends Partial<CreateNoteData> {
  id: string;
  isPinned?: boolean;
  isArchived?: boolean;
}

export interface TradeData {
  noteId: string;
  type: 'BUY' | 'SELL';
  amount: number;
  price: number;
}

export interface LeaderboardEntry {
  user: User;
  rank: number;
  score: number;
  change: number;
  badge?: string;
}

export interface SearchFilters {
  query?: string;
  type?: string;
  visibility?: string;
  tags?: string[];
  author?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: 'created' | 'updated' | 'title' | 'marketCap' | 'volume';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}