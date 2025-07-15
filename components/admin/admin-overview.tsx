'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Shield,
  Activity,
  DollarSign,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

// Mock admin data - in real app this would come from API
const adminStats = {
  totalUsers: 1247,
  activeUsers: 892,
  totalNotes: 5634,
  publishedNotes: 4521,
  totalRevenue: 125430.50,
  monthlyRevenue: 23450.75,
  systemHealth: 98.5,
  activeIssues: 3,
  resolvedIssues: 127,
};

export function AdminOverview() {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-neon-blue/10 to-neon-blue/5 border-neon-blue/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-neon-blue">
                  {adminStats.totalUsers.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {adminStats.activeUsers} active
                </p>
              </div>
              <Users className="w-8 h-8 text-neon-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-neon-green/10 to-neon-green/5 border-neon-green/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Notes</p>
                <p className="text-2xl font-bold text-neon-green">
                  {adminStats.totalNotes.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {adminStats.publishedNotes} published
                </p>
              </div>
              <FileText className="w-8 h-8 text-neon-green" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-neon-yellow/10 to-neon-yellow/5 border-neon-yellow/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-neon-yellow">
                  {formatCurrency(adminStats.totalRevenue)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(adminStats.monthlyRevenue)} this month
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-neon-yellow" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-neon-purple/10 to-neon-purple/5 border-neon-purple/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">System Health</p>
                <p className="text-2xl font-bold text-neon-purple">
                  {adminStats.systemHealth}%
                </p>
                <p className="text-xs text-muted-foreground">
                  All systems operational
                </p>
              </div>
              <Activity className="w-8 h-8 text-neon-purple" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Active Issues */}
            <div className="flex items-center gap-3 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Active Issues</p>
                <p className="text-2xl font-bold text-destructive">
                  {adminStats.activeIssues}
                </p>
              </div>
            </div>

            {/* Resolved Issues */}
            <div className="flex items-center gap-3 p-3 bg-neon-green/10 border border-neon-green/30 rounded-lg">
              <CheckCircle className="w-8 h-8 text-neon-green" />
              <div>
                <p className="text-sm text-muted-foreground">Resolved Issues</p>
                <p className="text-2xl font-bold text-neon-green">
                  {adminStats.resolvedIssues}
                </p>
              </div>
            </div>

            {/* Performance */}
            <div className="flex items-center gap-3 p-3 bg-neon-blue/10 border border-neon-blue/30 rounded-lg">
              <TrendingUp className="w-8 h-8 text-neon-blue" />
              <div>
                <p className="text-sm text-muted-foreground">Performance</p>
                <p className="text-2xl font-bold text-neon-blue">Excellent</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}