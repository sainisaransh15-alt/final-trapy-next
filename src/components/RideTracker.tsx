'use client';
import { useState } from 'react';
import { Play, CheckCircle, MapPin, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface RideTrackerProps {
  rideId: string;
  status: string;
  origin: string;
  destination: string;
  isDriver: boolean;
  onStatusChange?: () => void;
}

export default function RideTracker({
  rideId,
  status,
  origin,
  destination,
  isDriver,
  onStatusChange
}: RideTrackerProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleStartRide = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.rpc('start_ride', {
        p_ride_id: rideId,
        p_driver_id: user.id
      });
      
      if (error) throw error;
      
      toast({
        title: 'Ride Started!',
        description: 'Passengers have been notified.',
      });
      onStatusChange?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to start ride',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRide = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.rpc('complete_ride', {
        p_ride_id: rideId,
        p_driver_id: user.id
      });
      
      if (error) throw error;
      
      toast({
        title: 'Ride Completed!',
        description: 'Thank you for using Trapy.',
      });
      onStatusChange?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete ride',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Scheduled</Badge>;
      case 'started':
        return <Badge className="bg-emerald-100 text-emerald-700 animate-pulse">In Progress</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-primary/10 text-primary">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Ride Status</h3>
        {getStatusBadge()}
      </div>

      {/* Status Timeline */}
      <div className="relative pl-6 space-y-4 mb-4">
        <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-border" />
        
        {/* Origin */}
        <div className="relative">
          <div className={`absolute -left-4 w-4 h-4 rounded-full border-2 ${
            status === 'started' || status === 'completed' 
              ? 'bg-emerald border-emerald' 
              : 'bg-background border-primary'
          }`}>
            {(status === 'started' || status === 'completed') && (
              <CheckCircle className="w-3 h-3 text-white absolute top-0.5 left-0.5" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{origin}</span>
            {status === 'started' && (
              <span className="text-xs text-emerald animate-pulse">● Live</span>
            )}
          </div>
        </div>

        {/* Destination */}
        <div className="relative">
          <div className={`absolute -left-4 w-4 h-4 rounded-full border-2 ${
            status === 'completed' 
              ? 'bg-emerald border-emerald' 
              : 'bg-background border-muted-foreground'
          }`}>
            {status === 'completed' && (
              <CheckCircle className="w-3 h-3 text-white absolute top-0.5 left-0.5" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{destination}</span>
          </div>
        </div>
      </div>

      {/* Driver Actions */}
      {isDriver && (
        <div className="space-y-2">
          {status === 'active' && (
            <Button
              onClick={handleStartRide}
              disabled={loading}
              className="w-full bg-emerald hover:bg-emerald/90"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Start Ride
            </Button>
          )}
          
          {status === 'started' && (
            <Button
              onClick={handleCompleteRide}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Complete Ride
            </Button>
          )}
        </div>
      )}

      {/* Passenger View */}
      {!isDriver && status === 'started' && (
        <div className="bg-emerald-light rounded-lg p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald/20 flex items-center justify-center">
            <Clock className="w-4 h-4 text-emerald" />
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-700">Ride in Progress</p>
            <p className="text-xs text-muted-foreground">Your driver is on the way</p>
          </div>
        </div>
      )}
    </div>
  );
}
