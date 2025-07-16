'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  Users, 
  Settings, 
  Share2, 
  MessageSquare, 
  FileText, 
  Crown,
  Shield,
  User as UserIcon,
  ArrowLeft,
  MoreVertical
} from 'lucide-react';
import WorkspaceCanvas from '@/components/workspace/WorkspaceCanvas';
import { Note, User, Workspace, WorkspaceMember } from '@prisma/client';

interface NoteWithAuthor extends Note {
  author: Pick<User, 'id' | 'username' | 'name' | 'image'>;
}

interface WorkspaceWithMembers extends Workspace {
  members: (WorkspaceMember & {
    user: Pick<User, 'id' | 'username' | 'name' | 'image' | 'role' | 'isOnline'>;
  })[];
  _count: {
    notes: number;
    files: number;
  };
}

export default function WorkspacePage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;

  const [workspace, setWorkspace] = useState<WorkspaceWithMembers | null>(null);
  const [notes, setNotes] = useState<NoteWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'OWNER' | 'ADMIN' | 'MEMBER' | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');
  const [isInviting, setIsInviting] = useState(false);

  // Load workspace data
  const loadWorkspace = useCallback(async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`);
      if (response.ok) {
        const data = await response.json();
        setWorkspace(data.workspace);
        
        // Find user's role in workspace
        const userMember = data.workspace.members.find(
          (m: any) => m.userId === session?.user?.id
        );
        setUserRole(userMember?.role || null);
      } else if (response.status === 404) {
        toast.error('Workspace not found');
        router.push('/');
      } else if (response.status === 403) {
        toast.error('Access denied');
        router.push('/');
      }
    } catch (error) {
      console.error('Error loading workspace:', error);
      toast.error('Failed to load workspace');
    }
  }, [workspaceId, session?.user?.id, router]);

  // Load notes
  const loadNotes = useCallback(async () => {
    try {
      const response = await fetch(`/api/notes?workspaceId=${workspaceId}`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  // Load data on mount
  useEffect(() => {
    if (session && workspaceId) {
      loadWorkspace();
      loadNotes();
    }
  }, [session, workspaceId, loadWorkspace, loadNotes]);

  // Auto-refresh notes every 10 seconds
  useEffect(() => {
    const interval = setInterval(loadNotes, 10000);
    return () => clearInterval(interval);
  }, [loadNotes]);

  // Handle note creation
  const handleNoteCreate = useCallback(async (noteData: Partial<Note>) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(prev => [...prev, data.note]);
        toast.success('Note created');
      } else {
        toast.error('Failed to create note');
      }
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
    }
  }, []);

  // Handle note update
  const handleNoteUpdate = useCallback(async (id: string, updates: Partial<Note>) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(prev => prev.map(note => 
          note.id === id ? { ...note, ...data.note } : note
        ));
        toast.success('Note updated');
      } else {
        toast.error('Failed to update note');
      }
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  }, []);

  // Handle note deletion
  const handleNoteDelete = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotes(prev => prev.filter(note => note.id !== id));
        toast.success('Note moved to trash');
      } else {
        toast.error('Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  }, []);

  // Handle workspace invitation
  const handleInvite = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      });

      if (response.ok) {
        toast.success('Invitation sent');
        setShowInviteModal(false);
        setInviteEmail('');
        setInviteRole('MEMBER');
        loadWorkspace(); // Refresh to show new member
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  }, [workspaceId, inviteEmail, inviteRole, loadWorkspace]);

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Crown className="w-3 h-3 text-yellow-500" />;
      case 'MODERATOR':
        return <Shield className="w-3 h-3 text-blue-500" />;
      default:
        return <UserIcon className="w-3 h-3 text-gray-400" />;
    }
  };

  // Check if user can edit
  const canEdit = userRole === 'OWNER' || userRole === 'ADMIN' || userRole === 'MEMBER';
  const canInvite = userRole === 'OWNER' || userRole === 'ADMIN';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Workspace not found</h1>
          <p className="text-gray-600 mb-4">The workspace you're looking for doesn't exist or you don't have access.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-md"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{workspace.name}</h1>
                <p className="text-sm text-gray-500">{workspace.description}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Members */}
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{workspace.members.length} members</span>
                <div className="flex -space-x-2">
                  {workspace.members.slice(0, 5).map((member) => (
                    <div
                      key={member.id}
                      className="relative"
                      title={`${member.user.name || member.user.username || 'User'} (${member.role})`}
                    >
                      {member.user.image ? (
                        <img
                          src={member.user.image}
                          alt={member.user.name || member.user.username || 'User'}
                          className="w-8 h-8 rounded-full border-2 border-white"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center">
                          <UserIcon className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                      {member.user.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                  ))}
                  {workspace.members.length > 5 && (
                    <div className="w-8 h-8 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-xs text-gray-600">+{workspace.members.length - 5}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                {canInvite && (
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Invite</span>
                  </button>
                )}
                
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

                <button className="p-2 text-gray-500 hover:text-gray-700 rounded-md">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="h-[calc(100vh-4rem)]">
        <WorkspaceCanvas
          workspaceId={workspaceId}
          notes={notes}
          onNoteCreate={handleNoteCreate}
          onNoteUpdate={handleNoteUpdate}
          onNoteDelete={handleNoteDelete}
          canEdit={canEdit}
        />
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Invite to Workspace</h2>
            <form onSubmit={handleInvite}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="user@example.com"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'MEMBER' | 'ADMIN')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MEMBER">Member - Can view and edit</option>
                  <option value="ADMIN">Admin - Can manage workspace</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isInviting ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}