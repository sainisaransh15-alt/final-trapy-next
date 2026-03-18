'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  User,
  Star,
  Shield,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Users,
  Check,
  X,
  Loader2,
  MessageCircle,
  Car,
} from 'lucide-react';

interface BookingDetails {
  id: string;
  seats_booked: number;
  total_price: number;
  status: string | null;
  created_at: string | null;
  passenger: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    rating: number | null;
    total_rides: number | null;
    is_aadhaar_verified: boolean | null;
    is_phone_verified: boolean | null;
    phone: string | null;
    gender: string | null;
  } | null;
  ride: {
    id: string;
    origin: string;
    destination: string;
    departure_time: string;
    price_per_seat: number;
  } | null;
  pickup_point: {
    name: string;
    address: string | null;
  } | null;
}

interface BookingReviewModalProps {
  bookingId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onActionComplete?: () => void;
}

export default function BookingReviewModal({
  bookingId,
  isOpen,
  onClose,
  onActionComplete,
}: BookingReviewModalProps) {
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [declining, setDeclining] = useState(false);

  useEffect(() => {
    if (bookingId && isOpen) {
      fetchBookingDetails();
    }
  }, [bookingId, isOpen]);

  const fetchBookingDetails = async () => {
    if (!bookingId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          seats_booked,
          total_price,
          status,
          created_at,
          passenger:profiles!bookings_passenger_id_fkey (
            id,
            full_name,
            avatar_url,
            rating,
            total_rides,
            is_aadhaar_verified,
            is_phone_verified,
            phone,
            gender
          ),
          ride:rides!bookings_ride_id_fkey (
            id,
            origin,
            destination,
            departure_time,
            price_per_seat
          ),
          pickup_point:pickup_points!bookings_pickup_point_id_fkey (
            name,
            address
          )
        `)
        .eq('id', bookingId)
        .maybeSingle();

      if (error) throw error;
      setBooking(data as unknown as BookingDetails);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load booking details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!booking) return;
    
    setConfirming(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', booking.id);

      if (error) throw error;

      // Send notification to passenger
      try {
        await supabase.functions.invoke('send-notification', {
          body: {
            userId: booking.passenger?.id,
            type: 'booking_confirmed',
            title: 'Booking Confirmed!',
            message: `Your booking for ${booking.ride?.origin} to ${booking.ride?.destination} has been confirmed.`,
            data: { booking_id: booking.id, ride_id: booking.ride?.id },
          },
        });
      } catch {
        console.warn('Failed to send confirmation notification');
      }

      toast({
        title: 'Booking Confirmed',
        description: 'The passenger has been notified.',
      });
      
      onClose();
      onActionComplete?.();
    } catch (error) {
      console.error('Error confirming booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to confirm booking',
        variant: 'destructive',
      });
    } finally {
      setConfirming(false);
    }
  };

  const handleDecline = async () => {
    if (!booking) return;
    
    if (!window.confirm('Are you sure you want to decline this booking?')) {
      return;
    }
    
    setDeclining(true);
    try {
      // Decline by cancelling the booking and restoring seats
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', booking.id);

      if (error) throw error;

      // Restore seats - get current seats first
      const { data: rideData } = await supabase
        .from('rides')
        .select('seats_available')
        .eq('id', booking.ride?.id || '')
        .single();

      if (rideData) {
        await supabase
          .from('rides')
          .update({ seats_available: rideData.seats_available + booking.seats_booked })
          .eq('id', booking.ride?.id || '');
      }

      // Send notification to passenger
      try {
        await supabase.functions.invoke('send-notification', {
          body: {
            userId: booking.passenger?.id,
            type: 'booking_cancelled',
            title: 'Booking Declined',
            message: `Your booking request for ${booking.ride?.origin} to ${booking.ride?.destination} was declined by the driver.`,
            data: { booking_id: booking.id, ride_id: booking.ride?.id },
          },
        });
      } catch {
        console.warn('Failed to send decline notification');
      }

      toast({
        title: 'Booking Declined',
        description: 'The booking has been cancelled.',
      });
      
      onClose();
      onActionComplete?.();
    } catch (error) {
      console.error('Error declining booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to decline booking',
        variant: 'destructive',
      });
    } finally {
      setDeclining(false);
    }
  };

  const handleChat = () => {
    if (booking?.id) {
      router.push(`/messages?booking=${booking.id}`);
      onClose();
    }
  };

  const handleViewProfile = () => {
    if (booking?.passenger?.id) {
      // Could router to a user profile page if it exists
      // For now, just keep the modal open as we're showing profile info
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" />
            Booking Request
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-20 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
            </div>
          </div>
        ) : booking ? (
          <div className="space-y-6 py-4">
            {/* Passenger Profile */}
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={booking.passenger?.avatar_url || ''} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {booking.passenger?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {booking.passenger?.full_name || 'Unknown User'}
                </h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {booking.passenger?.rating?.toFixed(1) || '0.0'}
                  </span>
                  <span>{booking.passenger?.total_rides || 0} rides</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {booking.passenger?.is_aadhaar_verified && (
                    <Badge variant="secondary" className="text-xs">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {booking.passenger?.gender && (
                    <Badge variant="outline" className="text-xs capitalize">
                      {booking.passenger.gender}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-muted/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Seats requested</span>
                <span className="font-semibold flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {booking.seats_booked}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total amount</span>
                <span className="font-semibold text-primary">₹{booking.total_price}</span>
              </div>
              {booking.pickup_point && (
                <div className="flex items-start justify-between">
                  <span className="text-sm text-muted-foreground">Pickup point</span>
                  <span className="font-medium text-right">
                    {booking.pickup_point.name}
                    {booking.pickup_point.address && (
                      <span className="block text-xs text-muted-foreground">
                        {booking.pickup_point.address}
                      </span>
                    )}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Requested at</span>
                <span className="text-sm">
                  {booking.created_at
                    ? format(new Date(booking.created_at), 'MMM d, h:mm a')
                    : 'N/A'}
                </span>
              </div>
            </div>

            {/* Ride Info */}
            {booking.ride && (
              <div className="border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(booking.ride.departure_time), 'EEE, MMM d')}
                  <Clock className="w-4 h-4 ml-2" />
                  {format(new Date(booking.ride.departure_time), 'h:mm a')}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium">{booking.ride.origin}</span>
                </div>
                <div className="w-0.5 h-4 bg-border ml-2" />
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium">{booking.ride.destination}</span>
                </div>
              </div>
            )}

            {/* Contact Option */}
            {booking.passenger?.phone && booking.passenger?.is_phone_verified && (
              <a
                href={`tel:${booking.passenger.phone}`}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <Phone className="w-5 h-5 text-primary" />
                <span className="text-sm">Call {booking.passenger.full_name}</span>
              </a>
            )}

            {/* Actions */}
            {booking.status === 'pending' ? (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={handleDecline}
                  disabled={declining || confirming}
                >
                  {declining ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <X className="w-4 h-4 mr-2" />
                  )}
                  Decline
                </Button>
                <Button
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                  onClick={handleConfirm}
                  disabled={confirming || declining}
                >
                  {confirming ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Confirm
                </Button>
              </div>
            ) : (
              <div className="text-center py-2">
                <Badge
                  variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                  className={booking.status === 'confirmed' ? 'bg-emerald-500' : ''}
                >
                  {booking.status === 'confirmed' ? 'Confirmed' : booking.status}
                </Badge>
              </div>
            )}

            {/* Chat Button */}
            <Button variant="outline" className="w-full" onClick={handleChat}>
              <MessageCircle className="w-4 h-4 mr-2" />
              Message {booking.passenger?.full_name?.split(' ')[0] || 'Passenger'}
            </Button>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Booking not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
