// PWA utilities for service worker registration and offline functionality

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

class PWAManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isInstalled = false;
  private isOnline = navigator.onLine;
  private onlineCallbacks: (() => void)[] = [];
  private offlineCallbacks: (() => void)[] = [];

  constructor() {
    this.init();
  }

  private init() {
    // Check if app is already installed
    this.checkInstallStatus();

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.notifyInstallAvailable();
    });

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.deferredPrompt = null;
      this.notifyInstalled();
    });

    // Listen for online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.onlineCallbacks.forEach(callback => callback());
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.offlineCallbacks.forEach(callback => callback());
    });

    // Register service worker
    this.registerServiceWorker();
  }

  private checkInstallStatus() {
    // Check if running in standalone mode (installed)
    this.isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone === true;
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        console.log('Service Worker registered successfully:', registration);

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.notifyUpdateAvailable();
              }
            });
          }
        });

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          this.handleServiceWorkerMessage(event.data);
        });

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  private handleServiceWorkerMessage(data: any) {
    switch (data.type) {
      case 'CACHE_UPDATED':
        this.notifyCacheUpdated();
        break;
      case 'OFFLINE_READY':
        this.notifyOfflineReady();
        break;
    }
  }

  // Public methods
  async installApp(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        return true;
      } else {
        console.log('User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('Error during app installation:', error);
      return false;
    } finally {
      this.deferredPrompt = null;
    }
  }

  canInstall(): boolean {
    return !!this.deferredPrompt && !this.isInstalled;
  }

  isAppInstalled(): boolean {
    return this.isInstalled;
  }

  isAppOnline(): boolean {
    return this.isOnline;
  }

  // Cache management
  async cacheNote(note: any) {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_NOTE',
        note
      });
    }
  }

  async clearCache() {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
  }

  // Background sync
  async requestBackgroundSync(tag: string) {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      // @ts-ignore - sync is not in the standard types yet
      await registration.sync.register(tag);
    }
  }

  // Push notifications
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return await Notification.requestPermission();
    }
    return 'denied';
  }

  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
          )
        });
        return subscription;
      } catch (error) {
        console.error('Error subscribing to push notifications:', error);
        return null;
      }
    }
    return null;
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Event listeners
  onInstallAvailable(callback: () => void) {
    this.installAvailableCallbacks.push(callback);
  }

  onInstalled(callback: () => void) {
    this.installedCallbacks.push(callback);
  }

  onUpdateAvailable(callback: () => void) {
    this.updateAvailableCallbacks.push(callback);
  }

  onOnline(callback: () => void) {
    this.onlineCallbacks.push(callback);
  }

  onOffline(callback: () => void) {
    this.offlineCallbacks.push(callback);
  }

  // Private callback arrays
  private installAvailableCallbacks: (() => void)[] = [];
  private installedCallbacks: (() => void)[] = [];
  private updateAvailableCallbacks: (() => void)[] = [];

  private notifyInstallAvailable() {
    this.installAvailableCallbacks.forEach(callback => callback());
  }

  private notifyInstalled() {
    this.installedCallbacks.forEach(callback => callback());
  }

  private notifyUpdateAvailable() {
    this.updateAvailableCallbacks.forEach(callback => callback());
  }

  private notifyCacheUpdated() {
    // Handle cache updates
    console.log('Cache updated');
  }

  private notifyOfflineReady() {
    // Handle offline ready state
    console.log('App ready for offline use');
  }
}

// Singleton instance
let pwaManager: PWAManager | null = null;

export const getPWAManager = (): PWAManager => {
  if (typeof window === 'undefined') {
    // Return a mock object for SSR
    return new (class MockPWAManager {
      private deferredPrompt = null;
      private isInstalled = false;
      private isOnline = true;
      private onlineCallbacks: (() => void)[] = [];
      private offlineCallbacks: (() => void)[] = [];
      private installAvailableCallbacks: (() => void)[] = [];
      private installedCallbacks: (() => void)[] = [];
      private updateAvailableCallbacks: (() => void)[] = [];

      async installApp() { return false; }
      canInstall() { return false; }
      isAppInstalled() { return false; }
      isAppOnline() { return true; }
      async cacheNote() {}
      async clearCache() {}
      async requestBackgroundSync() {}
      async requestNotificationPermission(): Promise<NotificationPermission> { return 'denied'; }
      async subscribeToPushNotifications() { return null; }
      onInstallAvailable() {}
      onInstalled() {}
      onUpdateAvailable() {}
      onOnline() {}
      onOffline() {}
      
      private init() {}
      private checkInstallStatus() {}
      private notifyInstallAvailable() {}
      private notifyInstalled() {}
      private notifyUpdateAvailable() {}
      private async registerServiceWorker() {}
      private handleServiceWorkerMessage() {}
      private urlBase64ToUint8Array() { return new Uint8Array(); }
      private notifyCacheUpdated() {}
      private notifyOfflineReady() {}
    })() as unknown as PWAManager;
  }

  if (!pwaManager) {
    pwaManager = new PWAManager();
  }
  return pwaManager;
};

// React hook for PWA functionality
export const usePWA = () => {
  const [canInstall, setCanInstall] = React.useState(false);
  const [isInstalled, setIsInstalled] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(true);
  const [updateAvailable, setUpdateAvailable] = React.useState(false);

  React.useEffect(() => {
    const pwa = getPWAManager();
    
    setCanInstall(pwa.canInstall());
    setIsInstalled(pwa.isAppInstalled());
    setIsOnline(pwa.isAppOnline());

    pwa.onInstallAvailable(() => setCanInstall(true));
    pwa.onInstalled(() => {
      setIsInstalled(true);
      setCanInstall(false);
    });
    pwa.onUpdateAvailable(() => setUpdateAvailable(true));
    pwa.onOnline(() => setIsOnline(true));
    pwa.onOffline(() => setIsOnline(false));
  }, []);

  const installApp = async () => {
    const pwa = getPWAManager();
    const success = await pwa.installApp();
    if (success) {
      setCanInstall(false);
      setIsInstalled(true);
    }
    return success;
  };

  const requestNotifications = async () => {
    const pwa = getPWAManager();
    const permission = await pwa.requestNotificationPermission();
    if (permission === 'granted') {
      await pwa.subscribeToPushNotifications();
    }
    return permission;
  };

  return {
    canInstall,
    isInstalled,
    isOnline,
    updateAvailable,
    installApp,
    requestNotifications,
    pwaManager: getPWAManager(),
  };
};

// Import React for the hook
import React from 'react';