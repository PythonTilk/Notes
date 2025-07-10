// User types
export interface User {
  id: number;
  name: string | null;
  email: string;
  role: UserRole;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

// Workspace types
export interface Workspace {
  id: number;
  name: string;
  description: string;
  color: string;
  creatorId: number;
  creator: User;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    notes: number;
    members: number;
  };
}

// Note types
export enum NoteType {
  TEXT = 'TEXT',
  CODE = 'CODE',
  IMAGE = 'IMAGE',
  LINK = 'LINK',
  FILE = 'FILE'
}

export interface Note {
  id: number;
  title: string;
  content: string;
  type: NoteType;
  workspaceId: number;
  authorId: number;
  author: User;
  createdAt: Date;
  updatedAt: Date;
  position?: {
    x: number;
    y: number;
  };
  imageUrls?: string[];
  tags?: string[];
}

// Theme type
export type Theme = 'light' | 'dark';

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Form state types
export interface FormState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  errorMessage: string;
}

// Navigation types
export interface NavItem {
  name: string;
  href: string;
  icon?: React.ComponentType<any>;
  current?: boolean;
}

// Dashboard stats
export interface DashboardStats {
  users: string | number;
  notes: string | number;
  bannedEmails: string | number;
}