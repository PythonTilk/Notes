
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, FolderIcon, UsersIcon, SearchIcon } from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';

interface Workspace {
  id: number;
  name: string;
  description: string;
  color: string;
  creator: {
    id: number;
    name: string;
    email: string;
  };
  _count: {
    notes: number;
    members: number;
  };
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    fetchWorkspaces();
  }, [session, status, router]);

  const fetchWorkspaces = async () => {
    try {
      const response = await fetch('/api/workspaces');
      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data);
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      toast.error('Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async () => {
    if (!newWorkspace.name.trim()) {
      toast.error('Workspace name is required');
      return;
    }

    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWorkspace),
      });

      if (response.ok) {
        const workspace = await response.json();
        setWorkspaces([workspace, ...workspaces]);
        setShowCreateModal(false);
        setNewWorkspace({ name: '', description: '', color: '#3B82F6' });
        toast.success('Workspace created successfully!');
      } else {
        toast.error('Failed to create workspace');
      }
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast.error('Failed to create workspace');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="border-b border-white/10 backdrop-blur-sm bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-white"
              >
                Welcome back, {session.user?.name || 'User'}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-purple-200 mt-2"
              >
                Manage your workspaces and collaborate with your team
              </motion.p>
            </div>
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <PlusIcon className="w-5 h-5" />
              New Workspace
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {workspaces.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="text-purple-300 text-8xl mb-6">🚀</div>
            <h3 className="text-2xl font-bold text-white mb-4">No workspaces yet</h3>
            <p className="text-purple-200 mb-8 max-w-md mx-auto">
              Create your first workspace to start organizing your notes and collaborating with others
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg"
            >
              Create Your First Workspace
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {workspaces.map((workspace, index) => (
              <motion.div
                key={workspace.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => router.push(`/workspace/${workspace.id}`)}
                className="workspace-card rounded-2xl p-6 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                    style={{ backgroundColor: workspace.color }}
                  >
                    {workspace.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-purple-200 text-sm">
                      <FolderIcon className="w-4 h-4" />
                      {workspace._count.notes}
                    </div>
                    <div className="flex items-center gap-1 text-purple-200 text-sm mt-1">
                      <UsersIcon className="w-4 h-4" />
                      {workspace._count.members}
                    </div>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-200 transition-colors">
                  {workspace.name}
                </h3>
                
                {workspace.description && (
                  <p className="text-purple-200 text-sm mb-4 line-clamp-2">
                    {workspace.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-purple-300 text-xs">
                    by {workspace.creator.name || workspace.creator.email}
                  </span>
                  <motion.div
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    whileHover={{ scale: 1.1 }}
                  >
                    <span className="text-white text-sm">→</span>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Create Workspace Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 modal-backdrop flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="modal-content rounded-2xl p-6 w-full max-w-md"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Create New Workspace</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    value={newWorkspace.name}
                    onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
                    className="w-full px-4 py-3 form-input rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter workspace name"
                  />
                </div>
                
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newWorkspace.description}
                    onChange={(e) => setNewWorkspace({ ...newWorkspace, description: e.target.value })}
                    className="w-full px-4 py-3 form-input rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows={3}
                    placeholder="Describe your workspace"
                  />
                </div>
                
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    Color Theme
                  </label>
                  <div className="flex gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewWorkspace({ ...newWorkspace, color })}
                        className={`w-8 h-8 rounded-full border-2 color-picker-button ${
                          newWorkspace.color === color ? 'border-white' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createWorkspace}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
