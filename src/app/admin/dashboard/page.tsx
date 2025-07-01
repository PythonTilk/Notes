
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return <div className="container">Loading...</div>;
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'ADMIN') {
    router.push('/login');
    return null;
  }

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <h2>Admin Panel</h2>
        <Link href="/admin/dashboard" className="active">Dashboard</Link>
        <Link href="/admin/users">Manage Users</Link>
        <Link href="/admin/banned-emails">Banned Emails</Link>
      </aside>
      <main className="admin-content">
        <h1>Admin Dashboard</h1>
        <div className="admin-card-grid">
          <div className="admin-card">
            <h3>Total Users</h3>
            <p>...</p> {/* Placeholder for actual data */}
          </div>
          <div className="admin-card">
            <h3>Total Notes</h3>
            <p>...</p> {/* Placeholder for actual data */}
          </div>
          <div className="admin-card">
            <h3>Banned Emails</h3>
            <p>...</p> {/* Placeholder for actual data */}
          </div>
        </div>
      </main>
    </div>
  );
}
