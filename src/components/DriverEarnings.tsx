'use client';
import { useState, useEffect, useCallback } from 'react';
import { IndianRupee, TrendingUp, Car, Users, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Earnings {
  total_rides: number;
  total_bookings: number;
  total_seats_sold: number;
  total_earnings: number;
  today_earnings: number;
  week_earnings: number;
  month_earnings: number;
  cancelled_bookings: number;
}

export default function DriverEarnings() {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('month');

  const fetchEarnings = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.rpc('get_driver_earnings', {
        p_driver_id: user.id
      });

      if (error) throw error;
      if (data && data.length > 0) {
        setEarnings(data[0]);
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchEarnings();
  }, [user, fetchEarnings]);

  const getDisplayEarnings = () => {
    if (!earnings) return 0;
    switch (period) {
      case 'today':
        return earnings.today_earnings;
      case 'week':
        return earnings.week_earnings;
      case 'month':
        return earnings.month_earnings;
      case 'all':
        return earnings.total_earnings;
      default:
        return earnings.month_earnings;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!earnings) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <IndianRupee className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No earnings data yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Complete rides to start earning
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald" />
            Your Earnings
          </CardTitle>
        </div>
  <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Earnings Display */}
        <div className="text-center py-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 rounded-xl">
          <p className="text-sm text-muted-foreground mb-1">
            {period === 'today' && "Today's"} 
            {period === 'week' && "This Week's"} 
            {period === 'month' && "This Month's"} 
            {period === 'all' && "Total"} Earnings
          </p>
          <p className="text-4xl font-bold text-emerald flex items-center justify-center">
            <IndianRupee className="w-8 h-8" />
            {getDisplayEarnings().toLocaleString('en-IN')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Car className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total Rides</span>
            </div>
            <p className="text-xl font-bold">{earnings.total_rides}</p>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Bookings</span>
            </div>
            <p className="text-xl font-bold">{earnings.total_bookings}</p>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-emerald" />
              <span className="text-xs text-muted-foreground">Seats Sold</span>
            </div>
            <p className="text-xl font-bold">{earnings.total_seats_sold}</p>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-4 h-4 text-destructive" />
              <span className="text-xs text-muted-foreground">Cancelled</span>
            </div>
            <p className="text-xl font-bold">{earnings.cancelled_bookings}</p>
          </div>
        </div>

        {/* Completion Rate */}
        {earnings.total_bookings > 0 && (
          <div className="bg-primary/5 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Completion Rate</span>
              <span className="font-bold text-primary">
                {Math.round(
                  ((earnings.total_bookings - earnings.cancelled_bookings) / 
                   earnings.total_bookings) * 100
                )}%
              </span>
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{
                  width: `${Math.round(
                    ((earnings.total_bookings - earnings.cancelled_bookings) /
                      earnings.total_bookings) * 100
                  )}%`,
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
