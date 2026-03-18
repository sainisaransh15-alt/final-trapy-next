'use client';
import { useState } from 'react';
import { Car, MapPin, Calendar, Users, X, Loader2, CheckCircle, Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

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

interface RidesManagementTabProps {
  rides: Ride[];
  onRefresh: () => void;
}

export function RidesManagementTab({ rides, onRefresh }: RidesManagementTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancelRide = async (rideId: string) => {
    setCancellingId(rideId);
    try {
      const { error } = await supabase
        .from('rides')
        .update({ status: 'cancelled' })
        .eq('id', rideId);

      if (error) throw error;

      toast({
        title: 'Ride Cancelled',
        description: 'The ride has been cancelled successfully.',
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel ride',
        variant: 'destructive',
      });
    } finally {
      setCancellingId(null);
    }
  };

  // Separate rides by status
  const activeRides = rides.filter(ride => ride.status === 'active' || ride.status === 'in_progress');
  const completedRides = rides.filter(ride => ride.status === 'completed');
  const cancelledRides = rides.filter(ride => ride.status === 'cancelled');

  const filterBySearch = (rideList: Ride[]) => {
    if (!searchQuery) return rideList;
    return rideList.filter(ride => 
      ride.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ride.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ride.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredActiveRides = filterBySearch(activeRides);
  const filteredCompletedRides = filterBySearch(completedRides);
  const filteredCancelledRides = filterBySearch(cancelledRides);

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

  const getFilteredRides = () => {
    switch (statusFilter) {
      case 'active': return filteredActiveRides;
      case 'completed': return filteredCompletedRides;
      case 'cancelled': return filteredCancelledRides;
      default: return filterBySearch(rides);
    }
  };

  const exportRides = () => {
    const ridesData = getFilteredRides();
    const csvContent = [
      ['Origin', 'Destination', 'Driver', 'Phone', 'Departure', 'Price', 'Seats Available', 'Status'],
      ...ridesData.map(ride => [
        ride.origin,
        ride.destination,
        ride.profiles?.full_name || '',
        ride.profiles?.phone || '',
        format(new Date(ride.departure_time), 'yyyy-MM-dd HH:mm'),
        ride.price_per_seat,
        ride.seats_available,
        ride.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rides_${statusFilter}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-500 text-white">Active</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500 text-white">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-primary text-primary-foreground">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const RideTable = ({ rideList, showCancel = true }: { rideList: Ride[]; showCancel?: boolean }) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-3 text-sm font-medium text-muted-foreground">Route</th>
            <th className="text-left p-3 text-sm font-medium text-muted-foreground">Driver</th>
            <th className="text-left p-3 text-sm font-medium text-muted-foreground">Date</th>
            <th className="text-left p-3 text-sm font-medium text-muted-foreground">Price</th>
            <th className="text-left p-3 text-sm font-medium text-muted-foreground">Seats</th>
            <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
            {showCancel && <th className="text-left p-3 text-sm font-medium text-muted-foreground">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rideList.map((ride) => (
            <tr key={ride.id} className="border-b border-border hover:bg-muted/30">
              <td className="p-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">{ride.origin}</p>
                    <p className="text-xs text-muted-foreground">→ {ride.destination}</p>
                  </div>
                </div>
              </td>
              <td className="p-3">
                <p className="text-sm">{ride.profiles?.full_name || 'Unknown'}</p>
                <p className="text-xs text-muted-foreground">{ride.profiles?.phone || '-'}</p>
              </td>
              <td className="p-3">
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(ride.departure_time), 'MMM d, h:mm a')}
                </div>
              </td>
              <td className="p-3 text-sm font-medium">₹{ride.price_per_seat}</td>
              <td className="p-3">
                <div className="flex items-center gap-1 text-sm">
                  <Users className="w-3 h-3" />
                  {ride.seats_available}
                </div>
              </td>
              <td className="p-3">{getStatusBadge(ride.status || 'active')}</td>
              {showCancel && (
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    {(ride.status === 'active' || ride.status === 'in_progress') && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleCancelRide(ride.id)}
                        disabled={cancellingId === ride.id}
                      >
                        {cancellingId === ride.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <X className="w-3 h-3" />
                        )}
                      </Button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {rideList.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No rides found
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by route or driver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rides</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={exportRides} className="gap-2 w-full sm:w-auto">
          <Download className="w-4 h-4" />
          <span className="sm:inline">Export</span>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-500">{activeRides.length}</p>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{completedRides.length}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-destructive">{cancelledRides.length}</p>
            <p className="text-sm text-muted-foreground">Cancelled</p>
          </CardContent>
        </Card>
      </div>

      {/* Conditional Display Based on Filter */}
      {statusFilter === 'all' ? (
        <>
          {/* Active Rides */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5 text-emerald-500" />
                Active Rides ({filteredActiveRides.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RideTable rideList={filteredActiveRides} showCancel={true} />
            </CardContent>
          </Card>

          {/* Completed Rides */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <CheckCircle className="w-5 h-5" />
                Completed Rides ({filteredCompletedRides.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RideTable rideList={filteredCompletedRides} showCancel={false} />
            </CardContent>
          </Card>

          {/* Cancelled Rides */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <X className="w-5 h-5" />
                Cancelled Rides ({filteredCancelledRides.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RideTable rideList={filteredCancelledRides} showCancel={false} />
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Rides ({getFilteredRides().length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RideTable rideList={getFilteredRides()} showCancel={statusFilter === 'active'} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
