
'use client';

import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface LogoutButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'text';
  size?: 'small' | 'medium' | 'large';
  showConfirm?: boolean;
}

export default function LogoutButton({ 
  className = '', 
  variant = 'danger',
  size = 'medium',
  showConfirm = true
}: LogoutButtonProps) {
  const [confirming, setConfirming] = useState(false);

  const handleLogout = () => {
    if (showConfirm && !confirming) {
      setConfirming(true);
      return;
    }
    
    signOut({ callbackUrl: '/login' });
  };

  const cancelLogout = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirming(false);
  };

  // Base classes
  let buttonClasses = 'flex items-center justify-center gap-2 rounded-lg transition-all duration-200 font-medium ';
  
  // Size classes
  if (size === 'small') {
    buttonClasses += 'px-3 py-1.5 text-sm ';
  } else if (size === 'large') {
    buttonClasses += 'px-6 py-3 text-base ';
  } else {
    buttonClasses += 'px-4 py-2 text-sm ';
  }
  
  // Variant classes
  if (variant === 'primary') {
    buttonClasses += 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 ';
  } else if (variant === 'secondary') {
    buttonClasses += 'bg-purple-600 text-white hover:bg-purple-700 ';
  } else if (variant === 'danger') {
    buttonClasses += 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 ';
  } else if (variant === 'text') {
    buttonClasses += 'bg-transparent text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 ';
  }
  
  // Add custom classes
  buttonClasses += className;

  return (
    <motion.button
      onClick={handleLogout}
      className={buttonClasses}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      initial={confirming ? { scale: 1.05 } : { scale: 1 }}
      animate={confirming ? { scale: 1 } : { scale: 1 }}
    >
      {confirming ? (
        <>
          <span>Confirm logout?</span>
          <button 
            onClick={cancelLogout}
            className="ml-2 text-xs bg-white/20 px-1.5 py-0.5 rounded hover:bg-white/30"
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Log out</span>
        </>
      )}
    </motion.button>
  );
}
