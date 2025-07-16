'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  Settings, 
  Shield, 
  Activity,
  TrendingUp,
  Database,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AdminStats {
  users: {
    total: number;
    active: number;
    online: number;
    newToday: number;
  };
  workspaces: {
    total: number;
    active: number;
  };
  notes: {
    total: number;
    createdToday: number;
  };
  files: {
    total: number;
    totalSize: number;
  };
  chat: {
    messagesTotal: number;
    messagesToday: number;
  };
}

interface SystemHealth {
  database: 'healthy' | 'warning' | 'error';
  storage: 'healthy' | 'warning' | 'error';
  memory: 'healthy' | 'warning' | 'error';
  lastBackup?: string;
  maintenanceMode: boolean;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
  user?: {
    username: string;
    image?: string;
  };
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Check admin access
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }
  }, [session, status, router]);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsRes, activitiesRes, settingsRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/activities?limit=10'),
          fetch('/api/admin/settings'),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (activitiesRes.ok) {
          const activitiesData = await activitiesRes.json();
          setActivities(activitiesData.activities || []);
        }

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setHealth({
            database: 'healthy',
            storage: 'healthy', 
            memory: 'healthy',
            lastBackup: settingsData.settings?.lastBackup,
            maintenanceMode: settingsData.settings?.maintenanceMode || false,
          });
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === 'ADMIN') {
      loadDashboardData();
    }
  }, [session]);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get health status color
  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/users')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                <Users className="w-4 h-4" />
                <span>Users</span>
              </button>
              <button
                onClick={() => router.push('/admin/settings')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              <button
                onClick={() => router.push('/admin/backups')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                <Database className="w-4 h-4" />
                <span>Backups</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Health */}
        {health && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">System Health</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Database</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getHealthColor(health.database)}`}>
                    {health.database}
                  </span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Storage</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getHealthColor(health.storage)}`}>
                    {health.storage}
                  </span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Memory</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getHealthColor(health.memory)}`}>
                    {health.memory}
                  </span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Maintenance</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    health.maintenanceMode ? 'text-orange-600 bg-orange-100' : 'text-green-600 bg-green-100'
                  }`}>
                    {health.maintenanceMode ? 'Active' : 'Normal'}
                  </span>
                </div>
              </div>
            </div>
            {health.lastBackup && (
              <div className="mt-4 text-sm text-gray-600">
                Last backup: {formatDistanceToNow(new Date(health.lastBackup), { addSuffix: true })}
              </div>
            )}
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Users */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.users.total}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <div className="mt-4 flex items-center space-x-4 text-sm">
                  <span className="text-green-600">
                    {stats.users.online} online
                  </span>
                  <span className="text-gray-500">
                    +{stats.users.newToday} today
                  </span>
                </div>
              </div>

              {/* Workspaces */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Workspaces</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.workspaces.total}</p>
                  </div>
                  <Activity className="w-8 h-8 text-green-600" />
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  {stats.workspaces.active} active
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Notes</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.notes.total}</p>
                  </div>
                  <FileText className="w-8 h-8 text-purple-600" />
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  +{stats.notes.createdToday} today
                </div>
              </div>

              {/* Files */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Files</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.files.total}</p>
                  </div>
                  <Database className="w-8 h-8 text-orange-600" />
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  {formatFileSize(stats.files.totalSize)} total
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="bg-white rounded-lg shadow-sm border">
            {activities.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No recent activity</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {activities.map((activity) => (
                  <div key={activity.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {activity.user?.image ? (
                          <img
                            src={activity.user.image}
                            alt={activity.user.username}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}