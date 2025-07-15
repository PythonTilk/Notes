'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Wrench, Clock, Shield } from 'lucide-react';

interface SystemSettings {
  maintenanceMode: boolean;
  maintenanceMessage?: string;
}

export default function MaintenancePage() {
  const { data: session, status } = useSession();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data.settings);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Check if user is admin and redirect if maintenance is disabled
  useEffect(() => {
    if (session?.user && !loading && settings && !settings.maintenanceMode) {
      window.location.href = '/';
    }
  }, [session, loading, settings]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <Wrench className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            System Maintenance
          </h1>
          <p className="text-gray-600">
            {settings?.maintenanceMessage || 
             'We are currently performing scheduled maintenance. Please check back soon.'}
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-2" />
            Maintenance in progress
          </div>
          
          {isAdmin && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-center text-sm text-blue-700 mb-2">
                <Shield className="w-4 h-4 mr-2" />
                Admin Access Available
              </div>
              <p className="text-xs text-blue-600 mb-3">
                You can access the admin panel to disable maintenance mode.
              </p>
              <a
                href="/admin"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Go to Admin Panel
              </a>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-400">
          Thank you for your patience
        </div>
      </div>
    </div>
  );
}