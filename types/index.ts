import { User, Note, Activity, Workspace, WorkspaceMember } from '@prisma/client';

export type UserWithRelations = User & {
  notes: Note[];
  activities: Activity[];
  workspaces: Workspace[];
  workspaceMembers: WorkspaceMember[];
};

export type NoteWithAuthor = Note & {
  author: User;
};

export interface DashboardStats {
  totalUsers: number;
  totalNotes: number;
  totalWorkspaces: number;
  activeUsers: number;
  topNotes: NoteWithAuthor[];
  recentActivities: Activity[];
  userGrowth: { date: string; users: number }[];
  noteGrowth: { date: string; notes: number }[];
}

export interface UserStats {
  totalNotes: number;
  totalWorkspaces: number;
  collaborations: number;
  recentActivity: Activity[];
}

export interface AdminUser extends User {
  _count: {
    notes: number;
    workspaces: number;
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
  collaborationAlerts: boolean;
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

export interface CollaborationData {
  workspaceId: string;
  noteId: string;
  action: 'EDIT' | 'COMMENT' | 'SHARE';
  data: any;
}

export interface SearchFilters {
  query?: string;
  type?: string;
  visibility?: string;
  tags?: string[];
  author?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: 'created' | 'updated' | 'title' | 'author';
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