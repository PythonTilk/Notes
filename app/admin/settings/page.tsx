'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Database, 
  Shield, 
  Mail, 
  Globe,
  Bell,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import toast from 'react-hot-toast';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailVerificationRequired: boolean;
  maxNotesPerUser: number;
  maxFileSize: number;
  allowPublicNotes: boolean;
  enableNotifications: boolean;
  enableAnalytics: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  backupEnabled: boolean;
  backupFrequency: string;
  maxBackups: number;
}

export default function SystemSettingsPage() {
  const { data: session, status } = useSession();
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'NoteVault',
    siteDescription: 'A modern note-taking application with trading-style dashboard',
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: false,
    maxNotesPerUser: 1000,
    maxFileSize: 10,
    allowPublicNotes: true,
    enableNotifications: true,
    enableAnalytics: true,
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    backupEnabled: true,
    backupFrequency: 'daily',
    maxBackups: 7,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'ADMIN') {
      redirect('/');
    }
  }, [session, status]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({
      siteName: 'NoteVault',
      siteDescription: 'A modern note-taking application with trading-style dashboard',
      maintenanceMode: false,
      registrationEnabled: true,
      emailVerificationRequired: false,
      maxNotesPerUser: 1000,
      maxFileSize: 10,
      allowPublicNotes: true,
      enableNotifications: true,
      enableAnalytics: true,
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      backupEnabled: true,
      backupFrequency: 'daily',
      maxBackups: 7,
    });
    toast.success('Settings reset to defaults');
  };

  const updateSetting = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Settings className="h-8 w-8" />
            System Settings
          </h1>
          <p className="text-gray-400 mt-1">
            Configure system-wide settings and preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
            ADMIN ACCESS
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* General Settings */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => updateSetting('siteName', e.target.value)}
                className="bg-background/50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => updateSetting('siteDescription', e.target.value)}
                className="bg-background/50"
                rows={3}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-gray-400">
                  Temporarily disable site access for maintenance
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Registration Enabled</Label>
                <p className="text-sm text-gray-400">
                  Allow new users to register accounts
                </p>
              </div>
              <Switch
                checked={settings.registrationEnabled}
                onCheckedChange={(checked) => updateSetting('registrationEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Verification Required</Label>
                <p className="text-sm text-gray-400">
                  Require email verification for new accounts
                </p>
              </div>
              <Switch
                checked={settings.emailVerificationRequired}
                onCheckedChange={(checked) => updateSetting('emailVerificationRequired', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* User Limits */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              User Limits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maxNotesPerUser">Max Notes Per User</Label>
              <Input
                id="maxNotesPerUser"
                type="number"
                value={settings.maxNotesPerUser}
                onChange={(e) => updateSetting('maxNotesPerUser', parseInt(e.target.value))}
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
              <Input
                id="maxFileSize"
                type="number"
                value={settings.maxFileSize}
                onChange={(e) => updateSetting('maxFileSize', parseInt(e.target.value))}
                className="bg-background/50"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Public Notes</Label>
                <p className="text-sm text-gray-400">
                  Allow users to create public notes
                </p>
              </div>
              <Switch
                checked={settings.allowPublicNotes}
                onCheckedChange={(checked) => updateSetting('allowPublicNotes', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Notifications</Label>
                <p className="text-sm text-gray-400">
                  Send system notifications to users
                </p>
              </div>
              <Switch
                checked={settings.enableNotifications}
                onCheckedChange={(checked) => updateSetting('enableNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Analytics</Label>
                <p className="text-sm text-gray-400">
                  Collect usage analytics and statistics
                </p>
              </div>
              <Switch
                checked={settings.enableAnalytics}
                onCheckedChange={(checked) => updateSetting('enableAnalytics', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="smtpHost">SMTP Host</Label>
              <Input
                id="smtpHost"
                value={settings.smtpHost}
                onChange={(e) => updateSetting('smtpHost', e.target.value)}
                className="bg-background/50"
                placeholder="smtp.gmail.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtpPort">SMTP Port</Label>
              <Input
                id="smtpPort"
                type="number"
                value={settings.smtpPort}
                onChange={(e) => updateSetting('smtpPort', parseInt(e.target.value))}
                className="bg-background/50"
                placeholder="587"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtpUser">SMTP Username</Label>
              <Input
                id="smtpUser"
                value={settings.smtpUser}
                onChange={(e) => updateSetting('smtpUser', e.target.value)}
                className="bg-background/50"
                placeholder="your-email@gmail.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtpPassword">SMTP Password</Label>
              <Input
                id="smtpPassword"
                type="password"
                value={settings.smtpPassword}
                onChange={(e) => updateSetting('smtpPassword', e.target.value)}
                className="bg-background/50"
                placeholder="••••••••"
              />
            </div>
          </CardContent>
        </Card>

        {/* Backup Settings */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Backup Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Automatic Backups</Label>
                <p className="text-sm text-gray-400">
                  Enable automatic database backups
                </p>
              </div>
              <Switch
                checked={settings.backupEnabled}
                onCheckedChange={(checked) => updateSetting('backupEnabled', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="backupFrequency">Backup Frequency</Label>
              <select
                id="backupFrequency"
                value={settings.backupFrequency}
                onChange={(e) => updateSetting('backupFrequency', e.target.value)}
                className="w-full px-3 py-2 bg-background/50 border border-border rounded-md text-white"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxBackups">Max Backups to Keep</Label>
              <Input
                id="maxBackups"
                type="number"
                value={settings.maxBackups}
                onChange={(e) => updateSetting('maxBackups', parseInt(e.target.value))}
                className="bg-background/50"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                <Database className="mr-2 h-4 w-4" />
                Create Backup Now
              </Button>
              <Button variant="outline" className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Restore from Backup
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="bg-red-500/10 border-red-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Reset All Settings</h3>
              <p className="text-sm text-gray-400">
                Reset all settings to their default values
              </p>
            </div>
            <Button variant="destructive" onClick={handleReset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button variant="outline" onClick={handleReset}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}