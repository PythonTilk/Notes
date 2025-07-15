'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  MoreHorizontal, 
  Shield, 
  User,
  ExternalLink,
  Ban,
  CheckCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { timeAgo } from '@/lib/utils';
import Link from 'next/link';

interface RecentUser {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  joinedAt: Date;
  lastActive: Date;
  notesCount: number;
  totalEarnings: number;
}

// Mock recent users data
const recentUsers: RecentUser[] = [
  {
    id: '1',
    name: 'Alex Chen',
    email: 'alex@example.com',
    role: 'USER',
    status: 'ACTIVE',
    joinedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    lastActive: new Date(Date.now() - 5 * 60 * 1000),
    notesCount: 12,
    totalEarnings: 1250.50,
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'USER',
    status: 'ACTIVE',
    joinedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    lastActive: new Date(Date.now() - 15 * 60 * 1000),
    notesCount: 8,
    totalEarnings: 890.25,
  },
  {
    id: '3',
    name: 'Mike Rodriguez',
    email: 'mike@example.com',
    role: 'USER',
    status: 'PENDING',
    joinedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    lastActive: new Date(Date.now() - 30 * 60 * 1000),
    notesCount: 3,
    totalEarnings: 245.75,
  },
  {
    id: '4',
    name: 'Emma Wilson',
    email: 'emma@example.com',
    role: 'USER',
    status: 'ACTIVE',
    joinedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    lastActive: new Date(Date.now() - 45 * 60 * 1000),
    notesCount: 15,
    totalEarnings: 1890.00,
  },
  {
    id: '5',
    name: 'David Kim',
    email: 'david@example.com',
    role: 'USER',
    status: 'SUSPENDED',
    joinedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    notesCount: 5,
    totalEarnings: 450.25,
  },
];

const getRoleIcon = (role: RecentUser['role']) => {
  return role === 'ADMIN' ? (
    <Shield className="w-3 h-3" />
  ) : (
    <User className="w-3 h-3" />
  );
};

const getRoleBadge = (role: RecentUser['role']) => {
  return role === 'ADMIN' ? (
    <Badge variant="destructive" className="text-xs">
      {getRoleIcon(role)}
      <span className="ml-1">Admin</span>
    </Badge>
  ) : (
    <Badge variant="outline" className="text-xs">
      {getRoleIcon(role)}
      <span className="ml-1">User</span>
    </Badge>
  );
};

const getStatusBadge = (status: RecentUser['status']) => {
  switch (status) {
    case 'ACTIVE':
      return <Badge variant="neon" className="text-xs">Active</Badge>;
    case 'SUSPENDED':
      return <Badge variant="destructive" className="text-xs">Suspended</Badge>;
    case 'PENDING':
      return <Badge variant="secondary" className="text-xs">Pending</Badge>;
    default:
      return <Badge variant="outline" className="text-xs">{status}</Badge>;
  }
};

export function RecentUsers() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Recent Users
        </CardTitle>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/users">
            View All
            <ExternalLink className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" alt={user.name} />
                  <AvatarFallback>
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    {getRoleBadge(user.role)}
                    {getStatusBadge(user.status)}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span>Joined {timeAgo(user.joinedAt)}</span>
                    <span>•</span>
                    <span>Last active {timeAgo(user.lastActive)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right text-sm">
                  <p className="font-medium">{user.notesCount} notes</p>
                  <p className="text-muted-foreground">
                    ${user.totalEarnings.toFixed(2)}
                  </p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      View Profile
                    </DropdownMenuItem>
                    {user.status === 'SUSPENDED' ? (
                      <DropdownMenuItem>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Unsuspend User
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem className="text-destructive">
                        <Ban className="mr-2 h-4 w-4" />
                        Suspend User
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}