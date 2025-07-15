import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { AdminOverview } from '@/components/admin/admin-overview';
import { SystemStats } from '@/components/admin/system-stats';
import { RecentUsers } from '@/components/admin/recent-users';
import { AdminActions } from '@/components/admin/admin-actions';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== UserRole.ADMIN) {
    redirect('/');
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Admin Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage users, content, and system settings
            </p>
          </div>
          <div className="bg-destructive/10 border border-destructive/30 px-3 py-1 rounded-md">
            <span className="text-destructive font-medium text-sm">ADMIN ACCESS</span>
          </div>
        </div>

        {/* Admin Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <AdminOverview />
            <RecentUsers />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <SystemStats />
            <AdminActions />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}