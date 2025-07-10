'use client';

import React, { ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { 
  HomeIcon, 
  FolderIcon, 
  UserIcon, 
  Cog6ToothIcon,
  BellIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { UserRole } from '@/types';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon, current: true },
    { name: 'Workspaces', href: '/workspaces', icon: FolderIcon, current: false },
    { name: 'Profile', href: '/profile', icon: UserIcon, current: false },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, current: false },
  ];

  // Add admin link if user is admin
  if (isAdmin) {
    navigation.push({ 
      name: 'Admin', 
      href: '/admin/dashboard', 
      icon: ShieldCheckIcon, 
      current: false 
    });
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-lg bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Mobile Menu Button */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link href="/" className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold">
                    N
                  </div>
                  <span className="ml-2 text-xl font-bold text-white">NoteVault</span>
                </Link>
              </div>
              
              {/* Mobile menu button */}
              <button
                type="button"
                className="ml-4 md:hidden inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-white/10 focus:outline-none"
                onClick={toggleMobileMenu}
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      item.current
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-1">
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Right side icons */}
            <div className="flex items-center space-x-4">
              {/* Search button */}
              <button
                onClick={toggleSearch}
                className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
              
              {/* Notifications */}
              <button className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                <BellIcon className="h-5 w-5" />
              </button>
              
              {/* User menu */}
              <div className="relative">
                <button className="flex items-center space-x-2 p-1 rounded-full text-white hover:bg-white/10 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/5 backdrop-blur-lg border-b border-white/10"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 rounded-lg text-base font-medium ${
                    item.current
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              ))}
              
              {/* Logout for mobile */}
              <button
                className="w-full text-left block px-3 py-2 rounded-lg text-base font-medium text-white/70 hover:bg-white/10 hover:text-white"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  router.push('/api/auth/signout');
                }}
              >
                <div className="flex items-center space-x-2">
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span>Logout</span>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search notes, workspaces, and more..."
                  className="w-full bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  autoFocus
                />
                <MagnifyingGlassIcon className="absolute left-3 top-3.5 h-5 w-5 text-white/60" />
                <button
                  className="absolute right-3 top-3.5 text-white/60 hover:text-white"
                  onClick={() => setIsSearchOpen(false)}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mt-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
                <p className="text-white/60 text-sm">Recent searches</p>
                <div className="mt-2 space-y-2">
                  <div className="p-2 hover:bg-white/10 rounded-lg cursor-pointer">
                    <p className="text-white">Project notes</p>
                  </div>
                  <div className="p-2 hover:bg-white/10 rounded-lg cursor-pointer">
                    <p className="text-white">Meeting minutes</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}