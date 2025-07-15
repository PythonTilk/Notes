'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, timeAgo } from '@/lib/utils';

interface LiveTrade {
  id: string;
  type: 'BUY' | 'SELL';
  noteTitle: string;
  amount: number;
  price: number;
  username: string;
  timestamp: Date;
}

// Mock live trades data
const generateMockTrade = (): LiveTrade => {
  const notes = [
    'AI Revolution Notes',
    'Crypto Trading Guide',
    'Web3 Development',
    'React Best Practices',
    'TypeScript Mastery',
    'Node.js Backend',
  ];
  
  const usernames = [
    'crypto_king',
    'note_trader',
    'web3_dev',
    'react_master',
    'ts_ninja',
    'backend_guru',
  ];

  return {
    id: Math.random().toString(36).substr(2, 9),
    type: Math.random() > 0.5 ? 'BUY' : 'SELL',
    noteTitle: notes[Math.floor(Math.random() * notes.length)],
    amount: Math.floor(Math.random() * 1000) + 100,
    price: Math.random() * 200 + 10,
    username: usernames[Math.floor(Math.random() * usernames.length)],
    timestamp: new Date(),
  };
};

export function LiveTrades() {
  const [trades, setTrades] = useState<LiveTrade[]>([]);

  useEffect(() => {
    // Initialize with some trades
    const initialTrades = Array.from({ length: 5 }, generateMockTrade);
    setTrades(initialTrades);

    // Simulate live trades
    const interval = setInterval(() => {
      const newTrade = generateMockTrade();
      setTrades(prev => [newTrade, ...prev.slice(0, 9)]); // Keep only 10 trades
    }, 3000 + Math.random() * 5000); // Random interval between 3-8 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-neon-green animate-pulse" />
          Live Trades
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto scrollbar-thin">
          {trades.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Waiting for trades...</p>
            </div>
          ) : (
            <div className="space-y-1">
              {trades.map((trade, index) => (
                <div
                  key={trade.id}
                  className={`p-3 border-l-2 hover:bg-accent/50 transition-colors ${
                    trade.type === 'BUY' 
                      ? 'border-l-trading-up bg-trading-up/5' 
                      : 'border-l-trading-down bg-trading-down/5'
                  } ${index === 0 ? 'animate-slide-in' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={trade.type === 'BUY' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {trade.type === 'BUY' ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {trade.type}
                      </Badge>
                      <span className="text-sm font-medium">
                        {formatCurrency(trade.amount)}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(trade.timestamp)}
                    </span>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-1">
                    <span className="font-medium text-foreground">
                      {trade.noteTitle}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      by @{trade.username}
                    </span>
                    <span className="font-mono">
                      @ {formatCurrency(trade.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}