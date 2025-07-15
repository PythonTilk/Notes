import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { MarketOverview } from '@/components/dashboard/market-overview';
import { LiveTrades } from '@/components/dashboard/live-trades';
import { UserStats } from '@/components/dashboard/user-stats';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { TopNotes } from '@/components/dashboard/top-notes';
import { WelcomeCard } from '@/components/dashboard/welcome-card';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <WelcomeCard user={session.user} />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <MarketOverview />
            <TopNotes />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <UserStats userId={session.user.id} />
            <LiveTrades />
            <RecentActivity userId={session.user.id} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}