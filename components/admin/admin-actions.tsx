'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  Database, 
  Download, 
  Upload,
  RefreshCw,
  AlertTriangle,
  Shield,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminActions() {
  const handleDatabaseBackup = () => {
    toast.success('Database backup initiated');
  };

  const handleSystemRestart = () => {
    toast.loading('System restart initiated...');
  };

  const handleClearCache = () => {
    toast.success('Cache cleared successfully');
  };

  const handleExportData = () => {
    toast.success('Data export started');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* System Actions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">System</h4>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={handleClearCache}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Clear Cache
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={handleSystemRestart}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Restart System
          </Button>
        </div>

        {/* Database Actions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Database</h4>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={handleDatabaseBackup}
          >
            <Database className="w-4 h-4 mr-2" />
            Backup Database
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={handleExportData}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>

        {/* Security Actions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Security</h4>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <Shield className="w-4 h-4 mr-2" />
            Security Audit
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <Upload className="w-4 h-4 mr-2" />
            Update Permissions
          </Button>
        </div>

        {/* Danger Zone */}
        <div className="pt-4 border-t border-border">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-destructive">Danger Zone</h4>
            
            <Button
              variant="destructive"
              size="sm"
              className="w-full justify-start"
              onClick={() => toast.error('This action is restricted')}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Reset Database
            </Button>
          </div>
        </div>

        {/* System Info */}
        <div className="pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Version: 1.0.0</p>
            <p>Build: 2024.07.15</p>
            <p>Environment: Production</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}