'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, LogOut, RefreshCw, Home, Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import trapyLogo from '@/assets/trapy-logo.png';

interface AdminNavbarProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  pendingVerifications?: number;
  activeSosAlerts?: number;
}

export function AdminNavbar({ 
  onRefresh, 
  isRefreshing, 
  pendingVerifications = 0,
  activeSosAlerts = 0 
}: AdminNavbarProps) {
  const { signOut, user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const totalAlerts = pendingVerifications + activeSosAlerts;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Admin Badge */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <img src={trapyLogo} alt="Trapy Logo" className="h-10 w-auto" />
            </Link>
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-700">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">Admin Panel</span>
                <span className="text-xs text-slate-400">{user?.email}</span>
              </div>
            </div>
          </div>

          {/* Center - Status Indicators */}
          <div className="hidden md:flex items-center gap-4">
            {totalAlerts > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-full border border-amber-500/20">
                <Bell className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-amber-500 font-medium">
                  {totalAlerts} pending
                </span>
              </div>
            )}
            {activeSosAlerts > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 rounded-full border border-red-500/20 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm text-red-500 font-medium">
                  {activeSosAlerts} SOS Active
                </span>
              </div>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Refresh Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onRefresh}
              disabled={isRefreshing}
              className="text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline ml-2">Refresh</span>
            </Button>

            {/* Go to Main Site */}
            <Link href="/dashboard">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Main Site</span>
              </Button>
            </Link>

            {/* Logout */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Admin Badge */}
      <div className="sm:hidden px-4 pb-2 flex items-center gap-2">
        <Shield className="w-4 h-4 text-primary" />
        <span className="text-sm text-slate-300">Admin Panel</span>
        {totalAlerts > 0 && (
          <Badge variant="destructive" className="ml-auto">
            {totalAlerts} alerts
          </Badge>
        )}
      </div>
    </nav>
  );
}
