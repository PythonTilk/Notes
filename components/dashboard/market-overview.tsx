'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Activity, ExternalLink } from 'lucide-react';
import { formatCurrency, formatPercentage, getChangeColor } from '@/lib/utils';
import Link from 'next/link';

// Mock data - in real app this would come from API
const marketData = {
  totalMarketCap: 45678900,
  totalVolume24h: 2345678,
  totalNotes: 1234,
  activeTraders: 567,
  topNotes: [
    {
      id: '1',
      title: 'AI Revolution Notes',
      symbol: 'AIREV',
      price: 125.50,
      change24h: 12.5,
      volume24h: 234567,
      marketCap: 1234567,
    },
    {
      id: '2',
      title: 'Crypto Trading Guide',
      symbol: 'CRYPT',
      price: 89.25,
      change24h: -5.2,
      volume24h: 123456,
      marketCap: 987654,
    },
    {
      id: '3',
      title: 'Web3 Development',
      symbol: 'WEB3D',
      price: 67.80,
      change24h: 8.7,
      volume24h: 98765,
      marketCap: 765432,
    },
  ],
};

export function MarketOverview() {
  return (
    <div className="space-y-6">
      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-neon-green/10 to-neon-green/5 border-neon-green/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Market Cap</p>
                <p className="text-2xl font-bold text-neon-green">
                  {formatCurrency(marketData.totalMarketCap)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-neon-green" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-neon-blue/10 to-neon-blue/5 border-neon-blue/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">24h Volume</p>
                <p className="text-2xl font-bold text-neon-blue">
                  {formatCurrency(marketData.totalVolume24h)}
                </p>
              </div>
              <Activity className="w-8 h-8 text-neon-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-neon-purple/10 to-neon-purple/5 border-neon-purple/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Notes</p>
                <p className="text-2xl font-bold text-neon-purple">
                  {marketData.totalNotes.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-neon-purple" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-neon-yellow/10 to-neon-yellow/5 border-neon-yellow/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Traders</p>
                <p className="text-2xl font-bold text-neon-yellow">
                  {marketData.activeTraders}
                </p>
              </div>
              <Activity className="w-8 h-8 text-neon-yellow" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Notes Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top Performing Notes
          </CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href="/market">
              View All
              <ExternalLink className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                    Note
                  </th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                    Price
                  </th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                    24h Change
                  </th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                    Volume
                  </th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                    Market Cap
                  </th>
                </tr>
              </thead>
              <tbody>
                {marketData.topNotes.map((note, index) => (
                  <tr key={note.id} className="border-b border-border/50 hover:bg-accent/50">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-neon-green to-neon-blue rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{note.title}</p>
                          <p className="text-sm text-muted-foreground">{note.symbol}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-right py-3 px-2 font-mono">
                      {formatCurrency(note.price)}
                    </td>
                    <td className={`text-right py-3 px-2 font-mono ${getChangeColor(note.change24h)}`}>
                      <div className="flex items-center justify-end gap-1">
                        {note.change24h > 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {formatPercentage(note.change24h)}
                      </div>
                    </td>
                    <td className="text-right py-3 px-2 font-mono text-muted-foreground">
                      {formatCurrency(note.volume24h)}
                    </td>
                    <td className="text-right py-3 px-2 font-mono text-muted-foreground">
                      {formatCurrency(note.marketCap)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}