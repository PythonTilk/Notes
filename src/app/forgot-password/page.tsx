
'use client';

import { useState } from 'react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      setMessage('If your email is in our system, you will receive a password reset link.');
    } else {
      setError('Failed to send password reset email. Please try again.');
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h1>Forgot Password</h1>
        <p className="text-center mb-6">Enter your email address and we'll send you a link to reset your password.</p>
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-full">
          Send Reset Link
        </button>
        <div className="auth-links mt-4">
          <p>
            <a href="/login">Back to Login</a>
          </p>
        </div>
      </form>
    </div>
  );
}
