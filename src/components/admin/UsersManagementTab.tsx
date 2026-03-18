'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, User, Shield, Ban, CheckCircle, XCircle, 
  Phone, Mail, Car, Calendar, Star, Eye, Edit, AlertTriangle, Download
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  gender: string | null;
  is_phone_verified: boolean | null;
  is_aadhaar_verified: boolean | null;
  is_dl_verified: boolean | null;
  subscription_tier: string | null;
  wallet_balance: number | null;
  fuel_points: number | null;
  rating: number | null;
  total_rides: number | null;
  referral_code: string | null;
  is_suspended: boolean | null;
  suspended_at: string | null;
  suspension_reason: string | null;
  created_at: string | null;
}

interface UserRide {
  id: string;
  origin: string;
  destination: string;
  departure_time: string;
  status: string | null;
  seats_available: number;
  price_per_seat: number;
}

interface UserBooking {
  id: string;
  seats_booked: number;
  total_price: number;
  status: string | null;
  created_at: string | null;
  ride: {
    origin: string;
    destination: string;
    departure_time: string;
  } | null;
}

export function UsersManagementTab() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'unverified' | 'suspended'>('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userRides, setUserRides] = useState<UserRide[]>([]);
  const [userBookings, setUserBookings] = useState<UserBooking[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    setDetailsLoading(true);
    try {
      // Fetch user's rides
      const { data: rides } = await supabase
        .from('rides')
        .select('id, origin, destination, departure_time, status, seats_available, price_per_seat')
        .eq('driver_id', userId)
        .order('departure_time', { ascending: false })
        .limit(10);

      // Fetch user's bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          id, seats_booked, total_price, status, created_at,
          ride:rides(origin, destination, departure_time)
        `)
        .eq('passenger_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      setUserRides(rides || []);
      setUserBookings(bookings as UserBooking[] || []);
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleViewUser = async (user: UserProfile) => {
    setSelectedUser(user);
    setShowUserModal(true);
    await fetchUserDetails(user.id);
  };

  const handleSuspendUser = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_suspended: true,
          suspended_at: new Date().toISOString(),
          suspension_reason: suspensionReason
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast.success('User suspended successfully');
      setShowSuspendModal(false);
      setSuspensionReason('');
      fetchUsers();
      setSelectedUser(prev => prev ? { ...prev, is_suspended: true, suspension_reason: suspensionReason } : null);
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error('Failed to suspend user');
    }
  };

  const handleUnsuspendUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_suspended: false,
          suspended_at: null,
          suspension_reason: null
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success('User unsuspended successfully');
      fetchUsers();
      setSelectedUser(prev => prev ? { ...prev, is_suspended: false, suspension_reason: null } : null);
    } catch (error) {
      console.error('Error unsuspending user:', error);
      toast.error('Failed to unsuspend user');
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = (
      user.full_name?.toLowerCase().includes(searchLower) ||
      user.phone?.includes(searchQuery) ||
      user.referral_code?.toLowerCase().includes(searchLower)
    );
    
    if (!matchesSearch) return false;
    
    switch (filterStatus) {
      case 'verified':
        return user.is_phone_verified || user.is_aadhaar_verified || user.is_dl_verified;
      case 'unverified':
        return !user.is_phone_verified && !user.is_aadhaar_verified && !user.is_dl_verified;
      case 'suspended':
        return user.is_suspended;
      default:
        return true;
    }
  });

  const exportUsers = () => {
    const csvContent = [
      ['Name', 'Phone', 'Gender', 'Phone Verified', 'Aadhaar Verified', 'DL Verified', 'Subscription', 'Rating', 'Total Rides', 'Suspended', 'Joined'],
      ...filteredUsers.map(user => [
        user.full_name || '',
        user.phone || '',
        user.gender || '',
        user.is_phone_verified ? 'Yes' : 'No',
        user.is_aadhaar_verified ? 'Yes' : 'No',
        user.is_dl_verified ? 'Yes' : 'No',
        user.subscription_tier || 'free',
        user.rating || 0,
        user.total_rides || 0,
        user.is_suspended ? 'Yes' : 'No',
        user.created_at ? format(new Date(user.created_at), 'yyyy-MM-dd') : ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getVerificationBadges = (user: UserProfile) => {
    const badges = [];
    if (user.is_phone_verified) badges.push({ label: 'Phone', color: 'bg-green-500' });
    if (user.is_aadhaar_verified) badges.push({ label: 'Aadhaar', color: 'bg-blue-500' });
    if (user.is_dl_verified) badges.push({ label: 'DL', color: 'bg-purple-500' });
    return badges;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 text-center">
                <Skeleton className="h-8 w-12 mx-auto mb-2" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or referral code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="unverified">Unverified</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={exportUsers} className="gap-2">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{users.length}</p>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">
              {users.filter(u => u.is_phone_verified).length}
            </p>
            <p className="text-sm text-muted-foreground">Verified</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {users.filter(u => u.subscription_tier === 'premium').length}
            </p>
            <p className="text-sm text-muted-foreground">Premium</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-destructive">
              {users.filter(u => u.is_suspended).length}
            </p>
            <p className="text-sm text-muted-foreground">Suspended</p>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {filteredUsers.map(user => (
          <Card key={user.id} className={user.is_suspended ? 'border-destructive/50 bg-destructive/5' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar_url || ''} />
                    <AvatarFallback>
                      {user.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{user.full_name || 'Unnamed User'}</p>
                      {user.is_suspended && (
                        <Badge variant="destructive" className="text-xs">Suspended</Badge>
                      )}
                      {user.subscription_tier === 'premium' && (
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-xs">Premium</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {user.phone && <span>{user.phone}</span>}
                      {user.referral_code && (
                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                          {user.referral_code}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1 mt-1">
                      {getVerificationBadges(user).map(badge => (
                        <span 
                          key={badge.label} 
                          className={`${badge.color} text-white text-xs px-1.5 py-0.5 rounded`}
                        >
                          {badge.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right mr-4 hidden md:block">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span>{user.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {user.total_rides || 0} rides
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleViewUser(user)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  {user.is_suspended ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-green-500 hover:text-green-600"
                      onClick={() => handleUnsuspendUser(user.id)}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowSuspendModal(true);
                      }}
                    >
                      <Ban className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Details Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* Profile Info */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedUser.avatar_url || ''} />
                  <AvatarFallback className="text-2xl">
                    {selectedUser.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.full_name || 'Unnamed User'}</h3>
                  <p className="text-muted-foreground">{selectedUser.phone}</p>
                  <p className="text-sm text-muted-foreground">
                    Joined {selectedUser.created_at ? format(new Date(selectedUser.created_at), 'MMM d, yyyy') : 'Unknown'}
                  </p>
                </div>
              </div>

              {/* Suspension Warning */}
              {selectedUser.is_suspended && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-destructive font-medium">
                    <AlertTriangle className="h-5 w-5" />
                    User is Suspended
                  </div>
                  {selectedUser.suspension_reason && (
                    <p className="text-sm mt-1 text-muted-foreground">
                      Reason: {selectedUser.suspension_reason}
                    </p>
                  )}
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold">₹{selectedUser.wallet_balance?.toFixed(0) || 0}</p>
                  <p className="text-xs text-muted-foreground">Wallet Balance</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold">{selectedUser.rating?.toFixed(1) || '0.0'}</p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold">{selectedUser.total_rides || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Rides</p>
                </div>
              </div>

              {/* Verification Status */}
              <div>
                <h4 className="font-medium mb-2">Verification Status</h4>
                <div className="flex gap-3">
                  <Badge variant={selectedUser.is_phone_verified ? 'default' : 'secondary'}>
                    {selectedUser.is_phone_verified ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                    Phone
                  </Badge>
                  <Badge variant={selectedUser.is_aadhaar_verified ? 'default' : 'secondary'}>
                    {selectedUser.is_aadhaar_verified ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                    Aadhaar
                  </Badge>
                  <Badge variant={selectedUser.is_dl_verified ? 'default' : 'secondary'}>
                    {selectedUser.is_dl_verified ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                    Driving License
                  </Badge>
                </div>
              </div>

              {/* Recent Rides */}
              {detailsLoading ? (
                <div className="text-center py-4">Loading history...</div>
              ) : (
                <>
                  <div>
                    <h4 className="font-medium mb-2">Recent Rides as Driver ({userRides.length})</h4>
                    {userRides.length > 0 ? (
                      <div className="space-y-2">
                        {userRides.slice(0, 5).map(ride => (
                          <div key={ride.id} className="flex justify-between items-center bg-muted/30 rounded p-2 text-sm">
                            <div>
                              <p>{ride.origin} → {ride.destination}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(ride.departure_time), 'MMM d, yyyy h:mm a')}
                              </p>
                            </div>
                            <Badge variant={ride.status === 'completed' ? 'default' : 'secondary'}>
                              {ride.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No rides as driver</p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Recent Bookings ({userBookings.length})</h4>
                    {userBookings.length > 0 ? (
                      <div className="space-y-2">
                        {userBookings.slice(0, 5).map(booking => (
                          <div key={booking.id} className="flex justify-between items-center bg-muted/30 rounded p-2 text-sm">
                            <div>
                              <p>
                                {booking.ride?.origin} → {booking.ride?.destination}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                ₹{booking.total_price} • {booking.seats_booked} seat(s)
                              </p>
                            </div>
                            <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                              {booking.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No bookings</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Suspend User Modal */}
      <Dialog open={showSuspendModal} onOpenChange={setShowSuspendModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Ban className="h-5 w-5" />
              Suspend User
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to suspend <strong>{selectedUser?.full_name}</strong>?</p>
            <div>
              <Label htmlFor="reason">Suspension Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for suspension..."
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuspendModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSuspendUser}>
              Suspend User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
