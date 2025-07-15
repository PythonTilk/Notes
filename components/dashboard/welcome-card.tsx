'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';

interface WelcomeCardProps {
  user: {
    name?: string | null;
    role: string;
  };
}

export function WelcomeCard({ user }: WelcomeCardProps) {
  const currentHour = new Date().getHours();
  const greeting = 
    currentHour < 12 ? 'Good morning' :
    currentHour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <Card className="bg-gradient-to-r from-neon-green/10 via-neon-blue/10 to-neon-purple/10 border-neon-green/30">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {greeting}, {user.name || 'Trader'}! 
              {user.role === 'ADMIN' && (
                <span className="ml-2 text-sm bg-destructive text-destructive-foreground px-2 py-1 rounded-md">
                  ADMIN
                </span>
              )}
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome to your trading dashboard. Ready to make some moves?
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="neon">
              <Link href="/notes/create">
                <Plus className="w-4 h-4 mr-2" />
                Create Note
              </Link>
            </Button>
            <Button asChild variant="trading">
              <Link href="/market">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Market
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border/50">
            <div className="w-10 h-10 bg-neon-green/20 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-neon-green" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Notes</p>
              <p className="text-lg font-semibold">12</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border/50">
            <div className="w-10 h-10 bg-neon-blue/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-neon-blue" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Portfolio Value</p>
              <p className="text-lg font-semibold text-neon-green">$15,420</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border/50">
            <div className="w-10 h-10 bg-neon-purple/20 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-neon-purple" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Today's P&L</p>
              <p className="text-lg font-semibold text-neon-green">+$1,240</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}