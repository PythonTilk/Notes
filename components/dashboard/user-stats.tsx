'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Wallet, TrendingUp, Award, Zap } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/utils';

interface UserStatsProps {
  userId: string;
}

// Mock user stats - in real app this would come from API
const userStats = {
  balance: 15420.50,
  totalEarnings: 8750.25,
  totalLosses: 2340.75,
  netProfit: 6409.50,
  level: 7,
  experience: 4850,
  experienceToNext: 6400,
  rank: 42,
  portfolioValue: 12580.30,
  totalTrades: 156,
  winRate: 68.5,
};

export function UserStats({ userId }: UserStatsProps) {
  const experiencePercentage = (userStats.experience / userStats.experienceToNext) * 100;
  const profitMargin = ((userStats.netProfit / userStats.totalEarnings) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Your Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance */}
        <div className="text-center p-4 bg-gradient-to-r from-neon-green/10 to-neon-blue/10 rounded-lg border border-neon-green/30">
          <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
          <p className="text-2xl font-bold text-neon-green">
            {formatCurrency(userStats.balance)}
          </p>
        </div>

        {/* Level Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-neon-yellow" />
              <span className="text-sm font-medium">Level {userStats.level}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              Rank #{userStats.rank}
            </span>
          </div>
          <Progress value={experiencePercentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {userStats.experience.toLocaleString()} / {userStats.experienceToNext.toLocaleString()} XP
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <TrendingUp className="w-5 h-5 mx-auto mb-1 text-neon-green" />
            <p className="text-xs text-muted-foreground">Net Profit</p>
            <p className="text-sm font-semibold text-neon-green">
              {formatCurrency(userStats.netProfit)}
            </p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Zap className="w-5 h-5 mx-auto mb-1 text-neon-blue" />
            <p className="text-xs text-muted-foreground">Win Rate</p>
            <p className="text-sm font-semibold text-neon-blue">
              {formatPercentage(userStats.winRate)}
            </p>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="space-y-3 pt-2 border-t border-border">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Portfolio Value</span>
            <span className="text-sm font-medium">
              {formatCurrency(userStats.portfolioValue)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Trades</span>
            <span className="text-sm font-medium">
              {userStats.totalTrades}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Earnings</span>
            <span className="text-sm font-medium text-neon-green">
              {formatCurrency(userStats.totalEarnings)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Losses</span>
            <span className="text-sm font-medium text-trading-down">
              {formatCurrency(userStats.totalLosses)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Profit Margin</span>
            <span className={`text-sm font-medium ${profitMargin > 0 ? 'text-neon-green' : 'text-trading-down'}`}>
              {formatPercentage(profitMargin)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}