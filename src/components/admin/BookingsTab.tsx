'use client';
import { useState } from 'react';
import { DollarSign, User, Car, Calendar, Search, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

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

interface BookingsTabProps {
  bookings: Booking[];
}

export function BookingsTab({ bookings }: BookingsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = !searchQuery || 
      booking.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.rides?.origin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.rides?.destination?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || booking.payment_status === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const exportBookings = () => {
    const csvContent = [
      ['Passenger', 'Phone', 'Origin', 'Destination', 'Departure', 'Seats', 'Total Price', 'Platform Fee', 'Status', 'Payment Status'],
      ...filteredBookings.map(b => [
        b.profiles?.full_name || '',
        b.profiles?.phone || '',
        b.rides?.origin || '',
        b.rides?.destination || '',
        b.rides?.departure_time ? format(new Date(b.rides.departure_time), 'yyyy-MM-dd HH:mm') : '',
        b.seats_booked,
        b.total_price,
        b.platform_fee,
        b.status,
        b.payment_status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-emerald text-white">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-white">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="bg-emerald/10 text-emerald">Paid</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-warning/10 text-warning">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'refunded':
        return <Badge variant="secondary">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalRevenue = bookings
    .filter(b => b.payment_status === 'completed')
    .reduce((sum, b) => sum + (b.platform_fee || 0), 0);

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by passenger or route..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
          <SelectTrigger className="w-full sm:w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={paymentFilter} onValueChange={(v: any) => setPaymentFilter(v)}>
          <SelectTrigger className="w-full sm:w-[130px]">
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="completed">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={exportBookings} className="gap-2">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Bookings ({filteredBookings.length})
            </CardTitle>
            <div className="text-left sm:text-right">
              <p className="text-sm text-muted-foreground">Platform Revenue</p>
              <p className="text-xl font-bold text-emerald">₹{totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Passenger</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Route</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Seats</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Fee</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Payment</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-border hover:bg-muted/30">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{booking.profiles?.full_name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{booking.profiles?.phone || '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm">{booking.rides?.origin || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">→ {booking.rides?.destination || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(booking.created_at), 'MMM d, yyyy')}
                    </div>
                  </td>
                  <td className="p-3 text-sm">{booking.seats_booked}</td>
                  <td className="p-3 text-sm font-medium">₹{booking.total_price}</td>
                  <td className="p-3 text-sm text-emerald font-medium">₹{booking.platform_fee}</td>
                  <td className="p-3">{getStatusBadge(booking.status || 'pending')}</td>
                  <td className="p-3">{getPaymentBadge(booking.payment_status || 'pending')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredBookings.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No bookings found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
