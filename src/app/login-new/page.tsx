'use client';

import { useState, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { EnvelopeIcon, LockClosedIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import toast, { Toaster } from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const verificationEmailRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.ok) {
        toast.success('Login successful!');
        router.push('/dashboard');
      } else {
        // Check if the error is due to email verification
        if (result?.error?.includes('verification')) {
          setErrorMessage('Email not verified. Please check your inbox or request a new verification email.');
          if (verificationEmailRef.current) {
            verificationEmailRef.current.value = email;
          }
          setShowVerificationForm(true);
        } else {
          setErrorMessage('Invalid email or password');
        }
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    const verificationEmail = verificationEmailRef.current?.value;
    
    if (!verificationEmail) {
      setErrorMessage('Please enter your email address');
      return;
    }

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: verificationEmail }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Verification email sent! Please check your inbox.');
        setShowVerificationForm(false);
      } else {
        setErrorMessage(data.message || 'Failed to send verification email');
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Toaster position="top-right" />
      
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-40 -left-20 w-60 h-60 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-40 right-20 w-60 h-60 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-block"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
              N
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-3xl font-bold text-white mb-2"
          >
            Welcome to NoteVault
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-white/70"
          >
            Sign in to continue to your notes
          </motion.p>
        </div>
        
        <Card variant="glass" className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Sign In</h2>
          
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-white px-4 py-3 rounded-xl mb-6"
            >
              {errorMessage}
            </motion.div>
          )}
          
          {!showVerificationForm ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                leftIcon={<EnvelopeIcon className="w-5 h-5" />}
                required
              />
              
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                leftIcon={<LockClosedIcon className="w-5 h-5" />}
                required
              />
              
              <div className="pt-2">
                <Button
                  type="submit"
                  isLoading={loading}
                  className="w-full"
                  rightIcon={<ArrowRightIcon className="w-5 h-5" />}
                >
                  Sign In
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white mb-4">Resend Verification Email</h3>
              <form onSubmit={handleResendVerification}>
                <Input
                  label="Email Address"
                  type="email"
                  ref={verificationEmailRef}
                  placeholder="Enter your email"
                  leftIcon={<EnvelopeIcon className="w-5 h-5" />}
                  required
                />
                
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full"
                  >
                    Send Verification Email
                  </Button>
                </div>
              </form>
              
              <div className="pt-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowVerificationForm(false)}
                >
                  Back to Login
                </Button>
              </div>
            </div>
          )}
          
          <div className="mt-6 text-center space-y-3">
            <p className="text-white/70 text-sm">
              Don't have an account?{' '}
              <Link href="/register" className="text-white hover:text-purple-300 font-medium transition-colors">
                Sign up
              </Link>
            </p>
            
            {!showVerificationForm && (
              <>
                <p>
                  <Link 
                    href="/forgot-password" 
                    className="text-white/70 hover:text-white text-sm transition-colors"
                  >
                    Forgot your password?
                  </Link>
                </p>
                <p>
                  <button 
                    onClick={() => setShowVerificationForm(true)}
                    className="text-white/70 hover:text-white text-sm transition-colors"
                  >
                    Resend verification email
                  </button>
                </p>
              </>
            )}
          </div>
        </Card>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8 text-white/50 text-sm"
        >
          © 2024 NoteVault. Built for collaboration.
        </motion.div>
      </motion.div>
    </div>
  );
}