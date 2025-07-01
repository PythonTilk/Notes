
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminBannedEmails() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bannedEmails, setBannedEmails] = useState([]);
  const [newBannedEmail, setNewBannedEmail] = useState('');

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated' || session?.user?.role !== 'ADMIN') {
      router.push('/login');
      return;
    }

    fetchBannedEmails();
  }, [session, status, router]);

  const fetchBannedEmails = async () => {
    const res = await fetch('/api/admin/banned-emails');
    if (res.ok) {
      const data = await res.json();
      setBannedEmails(data);
    } else {
      alert('Failed to fetch banned emails');
    }
  };

  const handleAddBannedEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBannedEmail) return;

    const res = await fetch('/api/admin/banned-emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: newBannedEmail }),
    });

    if (res.ok) {
      setNewBannedEmail('');
      fetchBannedEmails();
    } else {
      alert('Failed to add banned email');
    }
  };

  const handleRemoveBannedEmail = async (email: string) => {
    const res = await fetch(`/api/admin/banned-emails/${email}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      fetchBannedEmails();
    } else {
      alert('Failed to remove banned email');
    }
  };

  if (status === 'loading') {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <h2>Admin Panel</h2>
        <Link href="/admin/dashboard">Dashboard</Link>
        <Link href="/admin/users">Manage Users</Link>
        <Link href="/admin/banned-emails" className="active">Banned Emails</Link>
      </aside>
      <main className="admin-content">
        <h1>Banned Emails</h1>
        <form onSubmit={handleAddBannedEmail} className="mb-6">
          <div className="form-group flex">
            <input
              type="email"
              placeholder="Add new banned email"
              value={newBannedEmail}
              onChange={(e) => setNewBannedEmail(e.target.value)}
              className="flex-1 p-2 border rounded-l-md"
            />
            <button type="submit" className="btn btn-primary rounded-r-md">
              Add
            </button>
          </div>
        </form>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bannedEmails.map((bannedEmail: any) => (
                <tr key={bannedEmail.id}>
                  <td>{bannedEmail.email}</td>
                  <td>{new Date(bannedEmail.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => handleRemoveBannedEmail(bannedEmail.email)}
                      className="btn btn-danger btn-small"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
