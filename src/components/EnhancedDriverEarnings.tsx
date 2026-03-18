'use client';
import { useState, useEffect, useCallback } from 'react';
import { 
  IndianRupee, TrendingUp, Car, Users, XCircle, Loader2,
  Download, BarChart3 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

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

interface EarningsBreakdown {
  date: string;
  earnings: number;
  rides_count: number;
  bookings_count: number;
  seats_sold: number;
}

export default function EnhancedDriverEarnings() {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [breakdown, setBreakdown] = useState<EarningsBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const [chartPeriod, setChartPeriod] = useState<number>(30);

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

  const fetchBreakdown = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.rpc('get_driver_earnings_breakdown', {
        p_driver_id: user.id,
        p_days: chartPeriod
      });

      if (error) throw error;
      if (data) {
        type BreakdownRow = {
          date: string;
          earnings: number;
          rides_count: number;
          bookings_count: number;
          seats_sold: number;
        };

        setBreakdown(
          (data as BreakdownRow[]).map((d) => ({
            ...d,
            date: format(new Date(d.date), 'MMM d'),
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching earnings breakdown:', error);
    }
  }, [user, chartPeriod]);

  useEffect(() => {
    if (user) {
      fetchEarnings();
      fetchBreakdown();
    }
  }, [user, chartPeriod, fetchEarnings, fetchBreakdown]);

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

  const exportEarnings = () => {
    if (!earnings || breakdown.length === 0) return;

    const headers = ['Date', 'Earnings', 'Rides', 'Bookings', 'Seats Sold'];
    const rows = breakdown.map(b => [
      b.date,
      `₹${b.earnings}`,
      b.rides_count,
      b.bookings_count,
      b.seats_sold,
    ]);

    // Add summary
    rows.push([]);
    rows.push(['Tax Summary']);
    rows.push(['Total Earnings', `₹${earnings.total_earnings}`]);
    rows.push(['Total Rides', earnings.total_rides.toString()]);
    rows.push(['Platform Fee (5%)', `₹${Math.round(earnings.total_earnings * 0.05)}`]);
    rows.push(['Net Earnings', `₹${Math.round(earnings.total_earnings * 0.95)}`]);

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trapy-driver-earnings-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Export Complete',
      description: 'Your earnings report has been downloaded.',
    });
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
    <div className="space-y-6">
      {/* Main Earnings Card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald" />
              Your Earnings
            </CardTitle>
            <Button variant="outline" size="sm" onClick={exportEarnings}>
              <Download className="w-4 h-4 mr-2" />
              Tax Summary
            </Button>
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

      {/* Earnings Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Earnings Trend
            </CardTitle>
            <Tabs value={chartPeriod.toString()} onValueChange={(v) => setChartPeriod(Number(v))}>
              <TabsList>
                <TabsTrigger value="7">7D</TabsTrigger>
                <TabsTrigger value="30">30D</TabsTrigger>
                <TabsTrigger value="90">90D</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={breakdown}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(v) => `₹${v}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`₹${value}`, 'Earnings']}
                />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  stroke="hsl(var(--emerald))"
                  fill="hsl(var(--emerald) / 0.2)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Bookings & Seats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={breakdown}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar 
                  dataKey="bookings_count" 
                  fill="hsl(var(--primary))" 
                  name="Bookings"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="seats_sold" 
                  fill="hsl(var(--emerald))" 
                  name="Seats Sold"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
