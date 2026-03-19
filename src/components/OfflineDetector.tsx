'use client';
import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineDetector() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Sync the real online status on the client after hydration
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-16 left-0 right-0 bg-destructive text-destructive-foreground px-4 py-2 text-center z-50">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span className="text-sm font-medium">
          You're offline. Some features may not work properly.
        </span>
      </div>
    </div>
  );
}
