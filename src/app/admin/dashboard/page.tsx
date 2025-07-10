
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  UsersIcon, 
  DocumentTextIcon, 
  ShieldExclamationIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    users: '...',
    notes: '...',
    bannedEmails: '...'
  });

  useEffect(() => {
    // In a real app, you would fetch actual data here
    // This is just a placeholder for demonstration
    setTimeout(() => {
      setStats({
        users: '42',
        notes: '156',
        bannedEmails: '3'
      });
    }, 1000);
  }, []);

  if (status === 'loading') {
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

  if (status === 'unauthenticated' || session?.user?.role !== 'ADMIN') {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {/* Admin Sidebar */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-64 bg-white/10 backdrop-blur-lg border-r border-white/10 p-6 flex flex-col"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
            <ShieldExclamationIcon className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Admin Panel</h2>
        </div>
        
        <nav className="flex-1 space-y-2">
          <Link 
            href="/admin/dashboard" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/20 text-white font-medium"
          >
            <ChartBarIcon className="w-5 h-5" />
            Dashboard
          </Link>
          <Link 
            href="/admin/users" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:bg-white/10 transition-colors"
          >
            <UsersIcon className="w-5 h-5" />
            Manage Users
          </Link>
          <Link 
            href="/admin/banned-emails" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:bg-white/10 transition-colors"
          >
            <ShieldExclamationIcon className="w-5 h-5" />
            Banned Emails
          </Link>
        </nav>
        
        <div className="mt-auto pt-6 border-t border-white/10">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors w-full"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to App
          </button>
        </div>
      </motion.aside>
      
      {/* Main Content */}
      <main className="flex-1 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <button className="px-4 py-2 bg-white/10 rounded-lg text-white flex items-center gap-2 hover:bg-white/20 transition-colors">
              <Cog6ToothIcon className="w-5 h-5" />
              Settings
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <UsersIcon className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white/60 text-sm">Total Users</h3>
                  <p className="text-3xl font-bold text-white">{stats.users}</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <DocumentTextIcon className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white/60 text-sm">Total Notes</h3>
                  <p className="text-3xl font-bold text-white">{stats.notes}</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <ShieldExclamationIcon className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-white/60 text-sm">Banned Emails</h3>
                  <p className="text-3xl font-bold text-white">{stats.bannedEmails}</p>
                </div>
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
          >
            <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <UsersIcon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">New user registered</p>
                      <p className="text-white/60 text-sm">user@example.com</p>
                    </div>
                  </div>
                  <span className="text-white/60 text-sm">2 hours ago</span>
                </div>
              </div>
              
              <div className="p-4 bg-white/5 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <DocumentTextIcon className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">New note created</p>
                      <p className="text-white/60 text-sm">Project Ideas</p>
                    </div>
                  </div>
                  <span className="text-white/60 text-sm">5 hours ago</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
