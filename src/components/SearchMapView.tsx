'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, MapPin, Users, Clock, IndianRupee, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { loadGoogleMapsAPI, getCityCoordinates, LatLng } from '@/lib/googleMaps';
import { format } from 'date-fns';


const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const win = typeof window !== 'undefined' ? (window as any) : ({} as any);

interface RideWithDriver {
  id: string;
  origin: string;
  destination: string;
  departure_time: string;
  seats_available: number;
  price_per_seat: number;
  distance_km: number | null;
  driver_id: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
    rating: number | null;
    total_rides?: number | null;
    is_dl_verified?: boolean | null;
    is_phone_verified?: boolean | null;
    gender?: string | null;
  } | null;
}

interface SearchMapViewProps {
  rides: RideWithDriver[];
  className?: string;
}

interface RideWithCoords extends RideWithDriver {
  originCoords?: LatLng;
  destinationCoords?: LatLng;
}

export default function SearchMapView({ rides, className = '' }: SearchMapViewProps) {
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylinesRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ridesWithCoords, setRidesWithCoords] = useState<RideWithCoords[]>([]);
  const [selectedRide, setSelectedRide] = useState<RideWithCoords | null>(null);

  // Initialize map
  const initMap = useCallback(async () => {
    if (!mapRef.current || !GOOGLE_MAPS_API_KEY) {
      setError('Map container or API key not available');
      setIsLoading(false);
      return;
    }

    try {
      await loadGoogleMapsAPI(GOOGLE_MAPS_API_KEY);
      
      // Default center (India)
      const defaultCenter = { lat: 20.5937, lng: 78.9629 };
      
      mapInstanceRef.current = new win.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 5,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      });

      infoWindowRef.current = new win.google.maps.InfoWindow();

      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize map');
      setIsLoading(false);
    }
  }, []);

  // Initialize map on mount
  useEffect(() => {
    initMap();
    
    return () => {
      // Cleanup
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
      polylinesRef.current.forEach((line) => line.setMap(null));
      polylinesRef.current = [];
    };
  }, [initMap]);

  // Resolve coordinates for all rides
  useEffect(() => {
    const resolveCoordinates = async () => {
      const resolved = await Promise.all(
        rides.map(async (ride) => {
          const originCoords = await getCityCoordinates(ride.origin);
          const destinationCoords = await getCityCoordinates(ride.destination);
          return {
            ...ride,
            originCoords: originCoords || undefined,
            destinationCoords: destinationCoords || undefined,
          };
        })
      );
      setRidesWithCoords(resolved);
    };

    if (rides.length > 0) {
      resolveCoordinates();
    } else {
      setRidesWithCoords([]);
    }
  }, [rides]);

  // Update markers when rides change
  useEffect(() => {
    if (!mapInstanceRef.current || !win.google?.maps || ridesWithCoords.length === 0) return;

    // Clear existing markers and polylines
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    polylinesRef.current.forEach((line) => line.setMap(null));
    polylinesRef.current = [];

    const map = mapInstanceRef.current;
    const bounds = new win.google.maps.LatLngBounds();

    // Create markers and routes for each ride
    ridesWithCoords.forEach((ride, index) => {
      if (!ride.originCoords || !ride.destinationCoords) return;

      // Extend bounds
      bounds.extend(ride.originCoords);
      bounds.extend(ride.destinationCoords);

      // Color based on price
      const priceHue = Math.max(0, Math.min(120, 120 - (ride.price_per_seat / 10)));
      const routeColor = `hsl(${priceHue}, 70%, 50%)`;

      // Create polyline for route
      const routePath = [ride.originCoords, ride.destinationCoords];
      const polyline = new win.google.maps.Polyline({
        path: routePath,
        geodesic: true,
        strokeColor: routeColor,
        strokeOpacity: 0.6,
        strokeWeight: 3,
        map,
      });

      polyline.addListener('click', () => {
        setSelectedRide(ride);
        showInfoWindow(ride, ride.originCoords!);
      });

      polylinesRef.current.push(polyline);

      // Create origin marker
      const originMarker = new win.google.maps.Marker({
        position: ride.originCoords,
        map,
        icon: {
          path: win.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#22c55e',
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        title: `${ride.origin} → ${ride.destination}`,
        zIndex: index + 1,
      });

      originMarker.addListener('click', () => {
        setSelectedRide(ride);
        showInfoWindow(ride, ride.originCoords!);
      });

      markersRef.current.push(originMarker);

      // Create destination marker (smaller)
      const destMarker = new win.google.maps.Marker({
        position: ride.destinationCoords,
        map,
        icon: {
          path: win.google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: '#ef4444',
          fillOpacity: 0.7,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        title: ride.destination,
        zIndex: index,
      });

      markersRef.current.push(destMarker);
    });

    // Fit map to show all markers
    if (ridesWithCoords.some(r => r.originCoords)) {
      map.fitBounds(bounds, { padding: 50 });
    }
  }, [ridesWithCoords]);

  const showInfoWindow = (ride: RideWithCoords, position: LatLng) => {
    if (!infoWindowRef.current || !mapInstanceRef.current) return;

    const departureDate = new Date(ride.departure_time);
    const formattedTime = format(departureDate, 'h:mm a');
    const formattedDate = format(departureDate, 'MMM d');

    const content = `
      <div style="padding: 8px; min-width: 200px; font-family: system-ui, sans-serif;">
        <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">
          ${ride.origin} → ${ride.destination}
        </div>
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; color: #666; font-size: 12px;">
          <span>${formattedDate} at ${formattedTime}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span style="font-weight: 700; font-size: 16px; color: #22c55e;">₹${ride.price_per_seat}</span>
            <span style="color: #666; font-size: 12px;">/seat</span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px; color: #666; font-size: 12px;">
            <span>${ride.seats_available} seats</span>
          </div>
        </div>
        ${ride.profiles?.full_name ? `
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee; display: flex; align-items: center; gap: 8px;">
            <div style="width: 24px; height: 24px; border-radius: 50%; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 10px;">
              ${ride.profiles.full_name.charAt(0)}
            </div>
            <div>
              <div style="font-size: 12px; font-weight: 500;">${ride.profiles.full_name}</div>
              ${ride.profiles.rating ? `<div style="font-size: 11px; color: #666;">★ ${ride.profiles.rating.toFixed(1)}</div>` : ''}
            </div>
          </div>
        ` : ''}
        <button 
          onclick="window.location.href='/ride/${ride.id}'"
          style="width: 100%; margin-top: 12px; padding: 8px; background: #6366f1; color: white; border: none; border-radius: 6px; font-weight: 500; cursor: pointer; font-size: 13px;"
        >
          View Details
        </button>
      </div>
    `;

    infoWindowRef.current.setContent(content);
    infoWindowRef.current.setPosition(position);
    infoWindowRef.current.open(mapInstanceRef.current);
  };

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className={`bg-gradient-to-br from-indigo-100 to-emerald-50 rounded-xl flex items-center justify-center border border-border ${className}`}>
        <div className="text-center p-8">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Map unavailable</p>
          <p className="text-xs text-muted-foreground">API key not configured</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-gradient-to-br from-indigo-100 to-emerald-50 rounded-xl flex items-center justify-center border border-border ${className}`}>
        <div className="text-center p-8">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden border border-border ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-emerald-50 flex items-center justify-center z-10">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">Loading map...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full min-h-[400px]" />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg p-3 text-xs shadow-lg">
        <p className="font-medium mb-2">Map Legend</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 border border-white" />
            <span>Departure points</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 border border-white" />
            <span>Destinations</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-gradient-to-r from-green-500 to-red-500" />
            <span>Routes (color = price)</span>
          </div>
        </div>
        <p className="text-muted-foreground mt-2">{ridesWithCoords.length} rides shown</p>
      </div>

      {/* Selected ride card */}
      {selectedRide && (
        <div className="absolute top-4 right-4 w-72 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-sm">
                  {selectedRide.origin} → {selectedRide.destination}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(selectedRide.departure_time), 'MMM d, h:mm a')}
                </p>
              </div>
              <button 
                onClick={() => setSelectedRide(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1">
                <IndianRupee className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-emerald-600">₹{selectedRide.price_per_seat}</span>
                <span className="text-xs text-muted-foreground">/seat</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                {selectedRide.seats_available} left
              </Badge>
            </div>

            {selectedRide.profiles && (
              <div className="flex items-center gap-2 mb-3 pt-2 border-t border-border">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  {selectedRide.profiles.avatar_url ? (
                    <img 
                      src={selectedRide.profiles.avatar_url} 
                      alt="" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-medium">
                      {selectedRide.profiles.full_name?.charAt(0) || '?'}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{selectedRide.profiles.full_name}</p>
                  {selectedRide.profiles.rating && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {selectedRide.profiles.rating.toFixed(1)}
                    </div>
                  )}
                </div>
              </div>
            )}

            <Button 
              className="w-full" 
              size="sm"
              onClick={() => router.push(`/ride/${selectedRide.id}`)}
            >
              View Details
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
