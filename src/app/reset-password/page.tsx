
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('No reset token provided.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!token) {
      setError('No reset token found.');
      return;
    }

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password }),
    });

    if (res.ok) {
      setMessage('Your password has been reset successfully. You can now log in.');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } else {
      const data = await res.json();
      setError(data.message || 'Failed to reset password. Invalid or expired token.');
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h1>Reset Password</h1>
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
        {!token && !error && <div className="info-message">Loading...</div>}

        {token && (
          <>
            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <input
                type="password"
                id="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-full">
              Reset Password
            </button>
          </>
        )}
      </form>
    </div>
  );
}
