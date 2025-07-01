
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('No verification token provided.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        if (res.ok) {
          setMessage('Your email has been successfully verified!');
        } else {
          const data = await res.json();
          setError(data.message || 'Failed to verify email. Invalid or expired token.');
        }
      } catch (err) {
        setError('An error occurred during verification.');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="container">
      <div className="auth-form">
        <h1>Email Verification</h1>
        {loading && <div className="info-message">Verifying your email...</div>}
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        {!loading && (
          <div className="auth-links mt-4">
            {message && (
              <p>
                You can now <Link href="/login">log in</Link>.
              </p>
            )}
            {error && (
              <p>
                <Link href="/login">Back to Login</Link>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
