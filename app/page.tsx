'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Users, 
  FileText, 
  MessageSquare, 
  Settings, 
  Activity,
  Search,
  Filter,
  Grid,
  List,
  Crown,
  Shield,
  User as UserIcon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Workspace {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    username: string;
    name: string;
    image?: string;
  };
  members: Array<{
    id: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
    user: {
      id: string;
      username: string;
      name: string;
      image?: string;
      isOnline: boolean;
    };
  }>;
  _count: {
    notes: number;
    files: number;
  };
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({
    name: '',
    description: '',
  });
  const [isCreating, setIsCreating] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }
  }, [session, status, router]);

  // Load workspaces
  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        const response = await fetch('/api/workspaces');
        if (response.ok) {
          const data = await response.json();
          setWorkspaces(data.workspaces);
        }
      } catch (error) {
        console.error('Error loading workspaces:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      loadWorkspaces();
    }
  }, [session]);

  // Handle workspace creation
  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspace.name.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWorkspace),
      });

      if (response.ok) {
        const data = await response.json();
        setWorkspaces(prev => [data.workspace, ...prev]);
        setShowCreateModal(false);
        setNewWorkspace({ name: '', description: '' });
        router.push(`/workspaces/${data.workspace.id}`);
      }
    } catch (error) {
      console.error('Error creating workspace:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // Filter workspaces
  const filteredWorkspaces = workspaces.filter(workspace =>
    workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workspace.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <Crown className="w-3 h-3 text-yellow-500" />;
      case 'ADMIN':
        return <Shield className="w-3 h-3 text-blue-500" />;
      default:
        return <UserIcon className="w-3 h-3 text-gray-400" />;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">NoteVault</h1>
              <span className="text-sm text-gray-500">Collaborative Workspaces</span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search workspaces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* View Mode */}
              <div className="flex border border-gray-300 rounded-md">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 border-l border-gray-300 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Actions */}
              <button
                onClick={() => router.push('/chat')}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-md"
                title="Public Chat"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => router.push('/files')}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-md"
                title="Files"
              >
                <FileText className="w-5 h-5" />
              </button>

              {session.user?.role === 'ADMIN' && (
                <button
                  onClick={() => router.push('/admin')}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-md"
                  title="Admin Dashboard"
                >
                  <Settings className="w-5 h-5" />
                </button>
              )}

              {/* Create Workspace */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>New Workspace</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session.user.name || session.user.username}!
          </h2>
          <p className="text-gray-600">
            Manage your collaborative workspaces and stay connected with your team.
          </p>
        </div>

        {/* Workspaces */}
        {filteredWorkspaces.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No workspaces found' : 'No workspaces yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery 
                ? 'Try adjusting your search criteria.'
                : 'Create your first workspace to start collaborating.'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Create Workspace
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredWorkspaces.map((workspace) => (
              <div
                key={workspace.id}
                onClick={() => router.push(`/workspaces/${workspace.id}`)}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer ${
                  viewMode === 'list' ? 'flex items-center p-4' : 'p-6'
                }`}
              >
                {viewMode === 'grid' ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {workspace.name}
                      </h3>
                      <div className="flex -space-x-2">
                        {workspace.members.slice(0, 3).map((member) => (
                          <div
                            key={member.id}
                            className="relative"
                            title={`${member.user.username} (${member.role})`}
                          >
                            {member.user.image ? (
                              <img
                                src={member.user.image}
                                alt={member.user.username}
                                className="w-6 h-6 rounded-full border-2 border-white"
                              />
                            ) : (
                              <div className="w-6 h-6 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center">
                                <UserIcon className="w-3 h-3 text-gray-600" />
                              </div>
                            )}
                            {member.user.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
                            )}
                          </div>
                        ))}
                        {workspace.members.length > 3 && (
                          <div className="w-6 h-6 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center">
                            <span className="text-xs text-gray-600">+{workspace.members.length - 3}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {workspace.description || 'No description'}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>{workspace._count.notes} notes</span>
                        <span>{workspace._count.files} files</span>
                        <span>{workspace.members.length} members</span>
                      </div>
                      <span>{formatDistanceToNow(new Date(workspace.updatedAt), { addSuffix: true })}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {workspace.name}
                        </h3>
                        <div className="flex -space-x-1">
                          {workspace.members.slice(0, 3).map((member) => (
                            <div
                              key={member.id}
                              className="relative"
                              title={`${member.user.username} (${member.role})`}
                            >
                              {member.user.image ? (
                                <img
                                  src={member.user.image}
                                  alt={member.user.username}
                                  className="w-5 h-5 rounded-full border border-white"
                                />
                              ) : (
                                <div className="w-5 h-5 bg-gray-300 rounded-full border border-white flex items-center justify-center">
                                  <UserIcon className="w-3 h-3 text-gray-600" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mt-1 truncate">
                        {workspace.description || 'No description'}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                        <span>{workspace._count.notes} notes</span>
                        <span>{workspace._count.files} files</span>
                        <span>{workspace.members.length} members</span>
                        <span>{formatDistanceToNow(new Date(workspace.updatedAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Create New Workspace</h2>
            <form onSubmit={handleCreateWorkspace}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={newWorkspace.name}
                  onChange={(e) => setNewWorkspace(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="My Awesome Workspace"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newWorkspace.description}
                  onChange={(e) => setNewWorkspace(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe what this workspace is for..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newWorkspace.name.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}