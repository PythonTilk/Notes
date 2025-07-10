'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { 
  PlusIcon, 
  FolderIcon, 
  UsersIcon, 
  ClockIcon,
  DocumentTextIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { Workspace } from '@/types';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { workspaces, isLoading: workspacesLoading, createWorkspace } = useWorkspaces();
  const router = useRouter();
  
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
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleCreateWorkspace = async () => {
    if (!newWorkspace.name.trim()) {
      toast.error('Workspace name is required');
      return;
    }

    const result = await createWorkspace(newWorkspace);
    
    if (result) {
      setShowCreateModal(false);
      setNewWorkspace({ name: '', description: '', color: '#3B82F6' });
    }
  };

  if (authLoading || workspacesLoading) {
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AppLayout>
      {/* Welcome Section */}
      <section className="mb-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.name || 'User'}
          </h1>
          <p className="text-white/70">
            Organize your thoughts, collaborate with others, and boost your productivity
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card variant="glass" className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white/60 text-sm">Total Notes</h3>
                <p className="text-3xl font-bold text-white">42</p>
              </div>
            </div>
          </Card>
          
          <Card variant="glass" className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <FolderIcon className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white/60 text-sm">Workspaces</h3>
                <p className="text-3xl font-bold text-white">{workspaces.length}</p>
              </div>
            </div>
          </Card>
          
          <Card variant="glass" className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-white/60 text-sm">Recent Activity</h3>
                <p className="text-3xl font-bold text-white">12</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </section>
      
      {/* Workspaces Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Your Workspaces</h2>
          <Button
            onClick={() => setShowCreateModal(true)}
            leftIcon={<PlusIcon className="w-5 h-5" />}
          >
            New Workspace
          </Button>
        </div>
        
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
            <Button
              size="lg"
              onClick={() => setShowCreateModal(true)}
            >
              Create Your First Workspace
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {workspaces.map((workspace, index) => (
              <WorkspaceCard 
                key={workspace.id} 
                workspace={workspace} 
                index={index}
                onClick={() => router.push(`/workspace/${workspace.id}`)}
              />
            ))}
          </motion.div>
        )}
      </section>
      
      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Create New Workspace</h2>
            
            <div className="space-y-4">
              <Input
                label="Workspace Name"
                value={newWorkspace.name}
                onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
                placeholder="Enter workspace name"
              />
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newWorkspace.description}
                  onChange={(e) => setNewWorkspace({ ...newWorkspace, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={3}
                  placeholder="Describe your workspace"
                />
              </div>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Color Theme
                </label>
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewWorkspace({ ...newWorkspace, color })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        newWorkspace.color === color ? 'border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreateWorkspace}
              >
                Create
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AppLayout>
  );
}

interface WorkspaceCardProps {
  workspace: Workspace;
  index: number;
  onClick: () => void;
}

function WorkspaceCard({ workspace, index, onClick }: WorkspaceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      <Card
        variant="glass"
        className="p-6 cursor-pointer group"
        onClick={onClick}
      >
        <div className="flex items-start justify-between mb-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
            style={{ backgroundColor: workspace.color }}
          >
            {workspace.name.charAt(0).toUpperCase()}
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-white/60 text-sm">
              <DocumentTextIcon className="w-4 h-4" />
              {workspace._count.notes}
            </div>
            <div className="flex items-center gap-1 text-white/60 text-sm mt-1">
              <UsersIcon className="w-4 h-4" />
              {workspace._count.members}
            </div>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-200 transition-colors">
          {workspace.name}
        </h3>
        
        {workspace.description && (
          <p className="text-white/70 text-sm mb-4 line-clamp-2">
            {workspace.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-white/60 text-xs">
            by {workspace.creator.name || workspace.creator.email}
          </span>
          <motion.div
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            whileHover={{ scale: 1.1 }}
          >
            <ChevronRightIcon className="w-4 h-4 text-white" />
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}