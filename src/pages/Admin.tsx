'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, Users, FileText, Car, AlertTriangle, 
  Check, X, Loader2, Eye, Search, Mail, Lock, ArrowRight,
  DollarSign, Flag
} from 'lucide-react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { AdminNavbar } from '@/components/admin/AdminNavbar';
import { AdminStats } from '@/components/admin/AdminStats';
import { SosAlertsTab } from '@/components/admin/SosAlertsTab';
import { RidesManagementTab } from '@/components/admin/RidesManagementTab';
import { BookingsTab } from '@/components/admin/BookingsTab';
import { UsersManagementTab } from '@/components/admin/UsersManagementTab';
import { AnalyticsTab } from '@/components/admin/AnalyticsTab';
import { PromoCodesTab } from '@/components/admin/PromoCodesTab';
import { ReportsTab } from '@/components/admin/ReportsTab';

// Admin access is determined purely by the 'admin' role in user_roles table via has_role() RPC
// No hardcoded email - all authorization is enforced server-side

interface VerificationDocument {
  id: string;
  user_id: string;
  document_type: string;
  document_url: string;
  status: string;
  submitted_at: string;
  profiles: {
    full_name: string | null;
    phone: string | null;
  } | null;
}

interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  email?: string;
  is_aadhaar_verified: boolean;
  is_dl_verified: boolean;
  is_phone_verified: boolean;
  total_rides: number;
  rating: number;
  created_at: string;
  subscription_tier: string;
  wallet_balance: number;
}

interface Stats {
  totalUsers: number;
  totalRides: number;
  pendingVerifications: number;
  activeRides: number;
  totalBookings: number;
  activeSosAlerts: number;
  completedRides: number;
  totalRevenue: number;
}

interface SosAlert {
  id: string;
  user_id: string;
  alert_type: string;
  status: string;
  location_text: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
    phone: string | null;
  } | null;
}

interface Ride {
  id: string;
  origin: string;
  destination: string;
  departure_time: string;
  price_per_seat: number;
  seats_available: number;
  status: string;
  driver_id: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
    phone: string | null;
  } | null;
}

interface Booking {
  id: string;
  ride_id: string;
  passenger_id: string;
  seats_booked: number;
  total_price: number;
  platform_fee: number;
  status: string;
  payment_status: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
    phone: string | null;
  } | null;
  rides?: {
    origin: string;
    destination: string;
    departure_time: string;
  } | null;
}

export default function Admin() {
  const { user, signIn, signUp, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingDocs, setPendingDocs] = useState<VerificationDocument[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [sosAlerts, setSosAlerts] = useState<SosAlert[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingDoc, setProcessingDoc] = useState<string | null>(null);
  
  // Admin login state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  // Fetch functions with useCallback for real-time subscriptions
  const fetchStats = useCallback(async () => {
    try {
      const [
        profilesRes, 
        ridesRes, 
        docsRes, 
        activeRidesRes,
        completedRidesRes,
        bookingsRes,
        sosRes,
        revenueRes
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('rides').select('id', { count: 'exact', head: true }),
        supabase.from('verification_documents').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('rides').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('rides').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('bookings').select('id', { count: 'exact', head: true }),
        supabase.from('sos_alerts').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('bookings').select('platform_fee').eq('payment_status', 'completed'),
      ]);

      const totalRevenue = (revenueRes.data || []).reduce((sum: number, b: any) => sum + (b.platform_fee || 0), 0);

      setStats({
        totalUsers: profilesRes.count || 0,
        totalRides: ridesRes.count || 0,
        pendingVerifications: docsRes.count || 0,
        activeRides: activeRidesRes.count || 0,
        completedRides: completedRidesRes.count || 0,
        totalBookings: bookingsRes.count || 0,
        activeSosAlerts: sosRes.count || 0,
        totalRevenue,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const fetchPendingDocuments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('verification_documents')
        .select(`
          *,
          profiles!verification_documents_user_id_fkey (
            full_name,
            phone
          )
        `)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: true });

      if (error) throw error;
      setPendingDocs(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  const fetchSosAlerts = useCallback(async () => {
    try {
      const { data: alertsData, error } = await supabase
        .from('sos_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Fetch profiles for each alert
      if (alertsData && alertsData.length > 0) {
        const userIds = [...new Set(alertsData.map(a => a.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, phone')
          .in('id', userIds);

        const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
        
        const alertsWithProfiles = alertsData.map(alert => ({
          ...alert,
          profiles: profilesMap.get(alert.user_id) || null
        }));
        
        setSosAlerts(alertsWithProfiles);
      } else {
        setSosAlerts([]);
      }
    } catch (error) {
      console.error('Error fetching SOS alerts:', error);
    }
  }, []);

  const fetchRides = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('rides')
        .select(`
          *,
          profiles:driver_id (
            full_name,
            phone
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setRides(data || []);
    } catch (error) {
      console.error('Error fetching rides:', error);
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles:passenger_id (
            full_name,
            phone
          ),
          rides:ride_id (
            origin,
            destination,
            departure_time
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchStats(),
      fetchPendingDocuments(),
      fetchUsers(),
      fetchSosAlerts(),
      fetchRides(),
      fetchBookings(),
    ]);
    setIsRefreshing(false);
  }, [fetchStats, fetchPendingDocuments, fetchUsers, fetchSosAlerts, fetchRides, fetchBookings]);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  // Real-time subscriptions for admin panel
  useEffect(() => {
    if (!isAdmin) return;

    const channels: RealtimeChannel[] = [];

    // Subscribe to rides changes
    const ridesChannel = supabase
      .channel('admin-rides-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rides' },
        (payload) => {
          console.log('Rides change:', payload);
          fetchRides();
          fetchStats();
          
          // Show toast for ride status changes
          if (payload.eventType === 'UPDATE' && payload.new) {
            const newRide = payload.new as Ride;
            const oldRide = payload.old as Ride;
            if (newRide.status !== oldRide?.status) {
              toast({
                title: `Ride ${newRide.status}`,
                description: `Ride from ${newRide.origin} to ${newRide.destination} is now ${newRide.status}`,
              });
            }
          }
        }
      )
      .subscribe();
    channels.push(ridesChannel);

    // Subscribe to bookings changes
    const bookingsChannel = supabase
      .channel('admin-bookings-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          console.log('Bookings change:', payload);
          fetchBookings();
          fetchStats();
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: 'New Booking',
              description: 'A new booking has been created',
            });
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const newBooking = payload.new as Booking;
            const oldBooking = payload.old as Booking;
            if (newBooking.status !== oldBooking?.status) {
              toast({
                title: `Booking ${newBooking.status}`,
                description: `Booking status changed to ${newBooking.status}`,
              });
            }
          }
        }
      )
      .subscribe();
    channels.push(bookingsChannel);

    // Subscribe to SOS alerts
    const sosChannel = supabase
      .channel('admin-sos-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sos_alerts' },
        (payload) => {
          console.log('SOS Alert change:', payload);
          fetchSosAlerts();
          fetchStats();
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: '🚨 New SOS Alert!',
              description: 'An emergency alert has been triggered',
              variant: 'destructive',
            });
          }
        }
      )
      .subscribe();
    channels.push(sosChannel);

    // Subscribe to user profile changes
    const profilesChannel = supabase
      .channel('admin-profiles-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          console.log('Profiles change:', payload);
          fetchUsers();
          fetchStats();
        }
      )
      .subscribe();
    channels.push(profilesChannel);

    // Subscribe to verification documents changes
    const docsChannel = supabase
      .channel('admin-docs-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'verification_documents' },
        (payload) => {
          console.log('Documents change:', payload);
          fetchPendingDocuments();
          fetchStats();
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: 'New Verification Request',
              description: 'A new document has been submitted for verification',
            });
          }
        }
      )
      .subscribe();
    channels.push(docsChannel);

    // Cleanup subscriptions on unmount
    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [isAdmin, fetchRides, fetchBookings, fetchSosAlerts, fetchUsers, fetchPendingDocuments, fetchStats]);

  const checkAdminStatus = async () => {
    if (!user) {
      setLoading(false);
      setIsAdmin(false);
      return;
    }

    // Admin access determined purely by server-side role check
    // No client-side email validation - has_role() RPC is the single source of truth
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (error) throw error;
      
      setIsAdmin(data === true);
      if (data === true) {
        fetchAllData();
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    // No client-side email validation - server-side has_role() determines admin access
    // This prevents hardcoded email bypass vulnerabilities

    setLoginLoading(true);
    
    if (isSignUp) {
      const { error } = await signUp(adminEmail, adminPassword, 'Admin');
      if (error) {
        setLoginError(error.message || 'Signup failed. Please try again.');
      } else {
        setLoginError('');
        toast({
          title: 'Account Created',
          description: 'You can now sign in with your credentials.',
        });
        setIsSignUp(false);
      }
    } else {
      const { error } = await signIn(adminEmail, adminPassword);
      if (error) {
        if (error.message?.includes('Invalid login credentials')) {
          setLoginError('Account not found. Please sign up first.');
        } else {
          setLoginError(error.message || 'Login failed. Please check your credentials.');
        }
      }
    }
    
    setLoginLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoginLoading(true);
    setLoginError('');
    await signInWithGoogle();
    setLoginLoading(false);
  };

  const handleDocumentAction = async (
    docId: string,
    userId: string,
    docType: string,
    action: 'verified' | 'rejected'
  ) => {
    setProcessingDoc(docId);
    try {
      const { data, error } = await supabase.rpc('admin_review_document', {
        p_doc_id: docId,
        p_action: action,
        p_user_id: userId,
        p_doc_type: docType,
      });

      if (error) throw error;

      toast({
        title: action === 'verified' ? 'Document Verified' : 'Document Rejected',
        description: `The ${docType} document has been ${action}.`,
      });

      fetchPendingDocuments();
      fetchStats();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process document',
        variant: 'destructive',
      });
    } finally {
      setProcessingDoc(null);
    }
  };

  const getSecureDocumentUrl = async (docId: string): Promise<string | null> => {
    try {
      const { data: filePath, error } = await supabase.rpc('get_document_signed_url', {
        p_doc_id: docId,
      });

      if (error) throw error;
      if (!filePath) return null;

      const { data: signedUrl } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 3600);

      return signedUrl?.signedUrl || null;
    } catch (error) {
      console.error('Error getting document URL:', error);
      return null;
    }
  };

  const handleViewDocument = async (docId: string) => {
    const url = await getSecureDocumentUrl(docId);
    if (url) {
      window.open(url, '_blank');
    } else {
      toast({
        title: 'Error',
        description: 'Failed to load document. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.phone?.includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Show admin login form if not logged in or not an admin (server-side validated)
  if (!user || isAdmin === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-white">Admin Portal</h1>
            <p className="text-white/60 mt-2">Authorized personnel only</p>
          </div>

          <Card className="border-0 shadow-2xl">
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold text-center mb-6">Admin Login</h2>
              
              {loginError && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive text-center">{loginError}</p>
                </div>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="adminEmail"
                      type="email"
                      placeholder="Enter admin email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminPassword">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="adminPassword"
                      type="password"
                      placeholder="Enter password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loginLoading}>
                  {loginLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isSignUp ? 'Creating account...' : 'Signing in...'}
                    </>
                  ) : (
                    <>
                      {isSignUp ? 'Create Admin Account' : 'Access Admin Panel'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setLoginError('');
                  }}
                  className="text-primary font-medium text-sm hover:underline"
                >
                  {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </button>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-card px-4 text-muted-foreground">or</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                size="lg"
                onClick={handleGoogleSignIn}
                disabled={loginLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>Restricted Access</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-white/40 text-sm mt-6">
            This area is for authorized administrators only.
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <Shield className="w-12 h-12 mx-auto text-destructive mb-4" />
            <h1 className="text-xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-4">
              You don't have admin role assigned to your account.
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <AdminNavbar 
        onRefresh={fetchAllData} 
        isRefreshing={isRefreshing}
        pendingVerifications={stats?.pendingVerifications}
        activeSosAlerts={stats?.activeSosAlerts}
      />
      
      <div className="pt-20 sm:pt-16 pb-12">
        <div className="container px-4 max-w-7xl">
          {/* Admin Dashboard Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-400">Manage users, rides, and platform operations</p>
          </div>
          
          <AdminStats stats={stats} />

          <Tabs defaultValue="analytics" className="space-y-4">
            <TabsList className="flex flex-wrap h-auto gap-1 p-1 bg-slate-800/50 rounded-lg border border-slate-700">
              <TabsTrigger value="analytics" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3 text-slate-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Analytics</span>
              <span className="xs:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="verifications" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3 text-slate-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Verifications</span>
              <span className="sm:hidden">Verify</span>
              {stats && stats.pendingVerifications > 0 && (
                <Badge variant="destructive" className="ml-0.5 h-5 px-1.5 text-xs">
                  {stats.pendingVerifications}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sos" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3 text-slate-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              SOS
              {stats && stats.activeSosAlerts > 0 && (
                <Badge variant="destructive" className="ml-0.5 h-5 px-1.5 text-xs animate-pulse">
                  {stats.activeSosAlerts}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3 text-slate-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="rides" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3 text-slate-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Rides
            </TabsTrigger>
            <TabsTrigger value="bookings" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3 text-slate-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Bookings</span>
              <span className="sm:hidden">Book</span>
            </TabsTrigger>
            <TabsTrigger value="promos" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3 text-slate-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Promo Codes</span>
              <span className="sm:hidden">Promo</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3 text-slate-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Flag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="verifications">
            <Card>
              <CardHeader>
                <CardTitle>Pending Verifications</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingDocs.length === 0 ? (
                  <div className="text-center py-8">
                    <Check className="w-12 h-12 text-emerald mx-auto mb-4" />
                    <p className="text-muted-foreground">No pending verifications</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {doc.profiles?.full_name || 'Unknown User'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {doc.document_type.toUpperCase()} • {doc.profiles?.phone || 'No phone'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Submitted {format(new Date(doc.submitted_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDocument(doc.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-emerald hover:text-emerald"
                            disabled={processingDoc === doc.id}
                            onClick={() => handleDocumentAction(doc.id, doc.user_id, doc.document_type, 'verified')}
                          >
                            {processingDoc === doc.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                            disabled={processingDoc === doc.id}
                            onClick={() => handleDocumentAction(doc.id, doc.user_id, doc.document_type, 'rejected')}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sos">
            <SosAlertsTab alerts={sosAlerts} onRefresh={fetchSosAlerts} />
          </TabsContent>

          <TabsContent value="rides">
            <RidesManagementTab rides={rides} onRefresh={fetchRides} />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingsTab bookings={bookings} />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsTab />
          </TabsContent>

          <TabsContent value="users">
            <UsersManagementTab />
          </TabsContent>

          <TabsContent value="promos">
            <PromoCodesTab />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsTab />
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
}
