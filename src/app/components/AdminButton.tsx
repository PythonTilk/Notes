'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function AdminButton() {
  const { data: session } = useSession();
  const router = useRouter();

  // Only render the button if the user is an admin
  if (session?.user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => router.push('/admin/dashboard')}
      className="admin-button fixed right-6 bottom-20 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <ShieldCheckIcon className="w-5 h-5" />
      <span>Admin Panel</span>
    </motion.button>
  );
}