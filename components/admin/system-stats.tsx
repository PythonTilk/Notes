'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Server, 
  Database, 
  Cpu, 
  HardDrive,
  Wifi,
  Zap
} from 'lucide-react';

// Mock system stats - in real app this would come from API
const systemStats = {
  serverUptime: '99.9%',
  cpuUsage: 45,
  memoryUsage: 62,
  diskUsage: 38,
  networkLatency: '12ms',
  databaseConnections: 45,
  maxDatabaseConnections: 100,
  activeUsers: 892,
  peakUsers: 1200,
};

export function SystemStats() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="w-5 h-5" />
          System Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Server Uptime */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-neon-green" />
            <span className="text-sm">Server Uptime</span>
          </div>
          <span className="text-sm font-mono text-neon-green">
            {systemStats.serverUptime}
          </span>
        </div>

        {/* CPU Usage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-neon-blue" />
              <span className="text-sm">CPU Usage</span>
            </div>
            <span className="text-sm font-mono">{systemStats.cpuUsage}%</span>
          </div>
          <Progress value={systemStats.cpuUsage} className="h-2" />
        </div>

        {/* Memory Usage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-neon-yellow" />
              <span className="text-sm">Memory Usage</span>
            </div>
            <span className="text-sm font-mono">{systemStats.memoryUsage}%</span>
          </div>
          <Progress value={systemStats.memoryUsage} className="h-2" />
        </div>

        {/* Disk Usage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-neon-purple" />
              <span className="text-sm">Disk Usage</span>
            </div>
            <span className="text-sm font-mono">{systemStats.diskUsage}%</span>
          </div>
          <Progress value={systemStats.diskUsage} className="h-2" />
        </div>

        {/* Network Latency */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-neon-green" />
            <span className="text-sm">Network Latency</span>
          </div>
          <span className="text-sm font-mono text-neon-green">
            {systemStats.networkLatency}
          </span>
        </div>

        {/* Database Connections */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-neon-blue" />
              <span className="text-sm">DB Connections</span>
            </div>
            <span className="text-sm font-mono">
              {systemStats.databaseConnections}/{systemStats.maxDatabaseConnections}
            </span>
          </div>
          <Progress 
            value={(systemStats.databaseConnections / systemStats.maxDatabaseConnections) * 100} 
            className="h-2" 
          />
        </div>

        {/* Active Users */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-neon-purple" />
              <span className="text-sm">Active Users</span>
            </div>
            <span className="text-sm font-mono">
              {systemStats.activeUsers}/{systemStats.peakUsers}
            </span>
          </div>
          <Progress 
            value={(systemStats.activeUsers / systemStats.peakUsers) * 100} 
            className="h-2" 
          />
        </div>

        {/* System Health Indicator */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-center gap-2 p-3 bg-neon-green/10 border border-neon-green/30 rounded-lg">
            <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-neon-green">
              All Systems Operational
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}