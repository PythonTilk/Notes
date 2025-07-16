'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  X, 
  Smartphone, 
  Monitor, 
  Wifi, 
  WifiOff,
  Bell,
  BellOff
} from 'lucide-react';
import { usePWA } from '@/lib/pwa';
import { toast } from 'react-hot-toast';

export const InstallPrompt: React.FC = () => {
  const { canInstall, isInstalled, isOnline, installApp, requestNotifications } = usePWA();
  const [isVisible, setIsVisible] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    typeof window !== 'undefined' && Notification.permission === 'granted'
  );

  if (!canInstall || isInstalled || !isVisible) {
    return null;
  }

  const handleInstall = async () => {
    try {
      const success = await installApp();
      if (success) {
        toast.success('NoteVault installed successfully!');
        setIsVisible(false);
      } else {
        toast.error('Installation cancelled');
      }
    } catch (error) {
      console.error('Installation error:', error);
      toast.error('Installation failed');
    }
  };

  const handleNotifications = async () => {
    try {
      const permission = await requestNotifications();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        toast.success('Notifications enabled!');
      } else {
        toast.error('Notifications denied');
      }
    } catch (error) {
      console.error('Notification error:', error);
      toast.error('Failed to enable notifications');
    }
  };

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" />
            Install NoteVault
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          Install NoteVault for a better experience with offline access and notifications.
        </div>

        {/* Features */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Monitor className="w-4 h-4 text-green-600" />
            <span>Works like a native app</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-600" />
            ) : (
              <WifiOff className="w-4 h-4 text-orange-600" />
            )}
            <span>Offline functionality</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Smartphone className="w-4 h-4 text-blue-600" />
            <span>Mobile-friendly interface</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {notificationsEnabled ? (
              <Bell className="w-4 h-4 text-green-600" />
            ) : (
              <BellOff className="w-4 h-4 text-gray-400" />
            )}
            <span>Push notifications</span>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex gap-2">
          <Badge variant={isOnline ? "default" : "secondary"}>
            {isOnline ? "Online" : "Offline"}
          </Badge>
          {notificationsEnabled && (
            <Badge variant="default" className="bg-green-100 text-green-800">
              Notifications On
            </Badge>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={handleInstall}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-1" />
            Install App
          </Button>
          
          {!notificationsEnabled && (
            <Button 
              variant="outline"
              onClick={handleNotifications}
              className="flex-1"
            >
              <Bell className="w-4 h-4 mr-1" />
              Enable Notifications
            </Button>
          )}
        </div>

        <div className="text-xs text-gray-500 text-center">
          You can uninstall anytime from your browser settings
        </div>
      </CardContent>
    </Card>
  );
};

export const PWAStatus: React.FC = () => {
  const { isInstalled, isOnline, updateAvailable } = usePWA();

  if (!isInstalled) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex gap-2">
        <Badge variant={isOnline ? "default" : "destructive"}>
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3 mr-1" />
              Online
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 mr-1" />
              Offline
            </>
          )}
        </Badge>
        
        {updateAvailable && (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            Update Available
          </Badge>
        )}
      </div>
    </div>
  );
};