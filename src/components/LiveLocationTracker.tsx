'use client';
import { useState, useEffect, useCallback } from 'react';
import { Navigation, Loader2, AlertCircle, MapPin, Clock, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import GoogleMap from './GoogleMap';
import { LatLng, watchLocation, stopWatchingLocation, getHaversineDistance, formatDuration } from '@/lib/googleMaps';

interface LiveLocationTrackerProps {
  rideId: string;
  origin: string;
  destination: string;
  isDriver: boolean;
  rideStatus: string;
  onLocationUpdate?: (location: LatLng) => void;
}

export default function LiveLocationTracker({
  rideId,
  origin,
  destination,
  isDriver,
  rideStatus,
  onLocationUpdate,
}: LiveLocationTrackerProps) {
  const { user } = useAuth();
  const [driverLocation, setDriverLocation] = useState<LatLng | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [eta, setEta] = useState<number | null>(null);
  const [distanceRemaining, setDistanceRemaining] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to driver location updates (for passengers)
  useEffect(() => {
    if (isDriver || rideStatus !== 'started') return;

    const channel = supabase
      .channel(`ride-location-${rideId}`)
      .on('broadcast', { event: 'location_update' }, (payload) => {
        if (payload.payload?.location) {
          const loc = payload.payload.location as LatLng;
          setDriverLocation(loc);
          setLastUpdate(new Date());
          onLocationUpdate?.(loc);
          
          // Calculate ETA if we have destination
          if (payload.payload?.eta) {
            setEta(payload.payload.eta);
          }
          if (payload.payload?.distance) {
            setDistanceRemaining(payload.payload.distance);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [rideId, isDriver, rideStatus, onLocationUpdate]);

  // Start sharing location (for drivers)
  const startSharing = useCallback(() => {
    if (!user || !isDriver) return;

    const id = watchLocation(
      async (location) => {
        setDriverLocation(location);
        setLastUpdate(new Date());
        setError(null);
        onLocationUpdate?.(location);

        // Broadcast location to passengers
        try {
          await supabase.channel(`ride-location-${rideId}`).send({
            type: 'broadcast',
            event: 'location_update',
            payload: {
              location,
              timestamp: new Date().toISOString(),
              driverId: user.id,
            },
          });
        } catch (err) {
          console.error('Failed to broadcast location:', err);
        }
      },
      (error) => {
        console.error('Location error:', error);
        setError('Unable to get location. Please enable location services.');
        toast({
          title: 'Location Error',
          description: 'Please enable location services to share your location.',
          variant: 'destructive',
        });
      }
    );

    if (id !== null) {
      setWatchId(id);
      setIsSharing(true);
      toast({
        title: 'Location Sharing Started',
        description: 'Passengers can now see your live location.',
      });
    }
  }, [user, isDriver, rideId, onLocationUpdate]);

  // Stop sharing location
  const stopSharing = useCallback(() => {
    if (watchId !== null) {
      stopWatchingLocation(watchId);
      setWatchId(null);
      setIsSharing(false);
      toast({
        title: 'Location Sharing Stopped',
        description: 'Your location is no longer being shared.',
      });
    }
  }, [watchId]);

  // Auto-start sharing when ride starts (for drivers)
  useEffect(() => {
    if (isDriver && rideStatus === 'started' && !isSharing) {
      startSharing();
    }
    
    // Cleanup on unmount or ride completion
    return () => {
      if (watchId !== null) {
        stopWatchingLocation(watchId);
      }
    };
  }, [isDriver, rideStatus, isSharing, startSharing, watchId]);

  // Only show for started rides
  if (rideStatus !== 'started') {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Navigation className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">Live Tracking</h3>
              <p className="text-xs text-muted-foreground">
                {isDriver ? 'Sharing your location' : 'Driver location'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {driverLocation && (
              <Badge variant="secondary" className="bg-green-100 text-green-700 animate-pulse">
                ● Live
              </Badge>
            )}
            
            {isDriver && (
              <Button
                variant={isSharing ? 'destructive' : 'default'}
                size="sm"
                onClick={isSharing ? stopSharing : startSharing}
              >
                {isSharing ? (
                  <>Stop Sharing</>
                ) : (
                  <>
                    <Navigation className="w-4 h-4 mr-1" />
                    Share Location
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Map */}
      <GoogleMap
        origin={origin}
        destination={destination}
        driverLocation={driverLocation || undefined}
        showRoute={true}
        height="250px"
      />

      {/* Status Info */}
      <div className="p-4 bg-muted/30">
        {error ? (
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        ) : driverLocation ? (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Car className="w-3 h-3" />
                <span className="text-xs">Status</span>
              </div>
              <p className="font-semibold text-sm text-green-600">On the way</p>
            </div>
            
            {distanceRemaining !== null && (
              <div>
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <MapPin className="w-3 h-3" />
                  <span className="text-xs">Distance</span>
                </div>
                <p className="font-semibold text-sm">{distanceRemaining} km</p>
              </div>
            )}
            
            {eta !== null && (
              <div>
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs">ETA</span>
                </div>
                <p className="font-semibold text-sm">{formatDuration(eta)}</p>
              </div>
            )}
            
            {lastUpdate && (
              <div className="col-span-3 text-xs text-muted-foreground mt-2">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">
              {isDriver ? 'Getting your location...' : 'Waiting for driver location...'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
