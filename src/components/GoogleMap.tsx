'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2, MapPin, Navigation } from 'lucide-react';
import { loadGoogleMapsAPI, LatLng, getCityCoordinates } from '@/lib/googleMaps';


const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const win = typeof window !== 'undefined' ? (window as any) : ({} as any);

interface GoogleMapProps {
  origin?: string;
  destination?: string;
  originCoords?: LatLng;
  destinationCoords?: LatLng;
  driverLocation?: LatLng;
  pickupPoints?: Array<{ name: string; coords?: LatLng }>;
  height?: string;
  showRoute?: boolean;
  onDistanceCalculated?: (distanceKm: number, durationMins: number) => void;
  className?: string;
}

export default function GoogleMap({
  origin,
  destination,
  originCoords,
  destinationCoords,
  driverLocation,
  pickupPoints = [],
  height = '300px',
  showRoute = true,
  onDistanceCalculated,
  className = '',
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const directionsRendererRef = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedOrigin, setResolvedOrigin] = useState<LatLng | null>(null);
  const [resolvedDestination, setResolvedDestination] = useState<LatLng | null>(null);

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

      directionsRendererRef.current = new win.google.maps.DirectionsRenderer({
        map: mapInstanceRef.current,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#6366f1',
          strokeWeight: 5,
          strokeOpacity: 0.8,
        },
      });

      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize map');
      setIsLoading(false);
    }
  }, []);

  // Resolve addresses to coordinates
  useEffect(() => {
    const resolveAddresses = async () => {
      if (originCoords) {
        setResolvedOrigin(originCoords);
      } else if (origin) {
        const coords = await getCityCoordinates(origin);
        setResolvedOrigin(coords);
      }

      if (destinationCoords) {
        setResolvedDestination(destinationCoords);
      } else if (destination) {
        const coords = await getCityCoordinates(destination);
        setResolvedDestination(coords);
      }
    };

    resolveAddresses();
  }, [origin, destination, originCoords, destinationCoords]);

  // Initialize map on mount
  useEffect(() => {
    initMap();
    
    return () => {
      // Cleanup markers
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
      if (driverMarkerRef.current) {
        driverMarkerRef.current.setMap(null);
      }
    };
  }, [initMap]);

  // Update route and markers
  useEffect(() => {
    if (!mapInstanceRef.current || !win.google?.maps) return;
    
    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    const map = mapInstanceRef.current;

    // Add origin marker
    if (resolvedOrigin) {
      const originMarker = new win.google.maps.Marker({
        position: resolvedOrigin,
        map,
        icon: {
          path: win.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#22c55e',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
        title: origin || 'Origin',
      });
      markersRef.current.push(originMarker);
    }

    // Add destination marker
    if (resolvedDestination) {
      const destMarker = new win.google.maps.Marker({
        position: resolvedDestination,
        map,
        icon: {
          path: win.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#ef4444',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
        title: destination || 'Destination',
      });
      markersRef.current.push(destMarker);
    }

    // Calculate and display route
    if (showRoute && resolvedOrigin && resolvedDestination) {
      const directionsService = new win.google.maps.DirectionsService();
      
      directionsService.route(
        {
          origin: resolvedOrigin,
          destination: resolvedDestination,
          travelMode: win.google.maps.TravelMode.DRIVING,
        },
        (result: any, status: string) => {
          if (status === 'OK' && result && directionsRendererRef.current) {
            directionsRendererRef.current.setDirections(result);
            
            const leg = result.routes[0]?.legs[0];
            if (leg && onDistanceCalculated) {
              const distanceKm = Math.round((leg.distance?.value || 0) / 1000);
              const durationMins = Math.round((leg.duration?.value || 0) / 60);
              onDistanceCalculated(distanceKm, durationMins);
            }
          }
        }
      );
    } else if (resolvedOrigin && resolvedDestination) {
      // Just fit bounds to show both points
      const bounds = new win.google.maps.LatLngBounds();
      bounds.extend(resolvedOrigin);
      bounds.extend(resolvedDestination);
      map.fitBounds(bounds, { padding: 50 });
    } else if (resolvedOrigin) {
      map.setCenter(resolvedOrigin);
      map.setZoom(12);
    } else if (resolvedDestination) {
      map.setCenter(resolvedDestination);
      map.setZoom(12);
    }
  }, [resolvedOrigin, resolvedDestination, showRoute, origin, destination, onDistanceCalculated]);

  // Update driver location marker
  useEffect(() => {
    if (!mapInstanceRef.current || !win.google?.maps || !driverLocation) return;

    const map = mapInstanceRef.current;

    if (driverMarkerRef.current) {
      // Update existing marker position with animation
      driverMarkerRef.current.setPosition(driverLocation);
    } else {
      // Create new driver marker
      driverMarkerRef.current = new win.google.maps.Marker({
        position: driverLocation,
        map,
        icon: {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 2,
          anchor: new win.google.maps.Point(12, 22),
        },
        title: 'Driver Location',
        zIndex: 999,
      });
    }

    // Pan to driver location
    map.panTo(driverLocation);
  }, [driverLocation]);

  // Add pickup point markers
  useEffect(() => {
    if (!mapInstanceRef.current || !win.google?.maps || pickupPoints.length === 0) return;

    const map = mapInstanceRef.current;

    pickupPoints.forEach((point, index) => {
      if (point.coords) {
        const marker = new win.google.maps.Marker({
          position: point.coords,
          map,
          icon: {
            path: win.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#f59e0b',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
          label: {
            text: String(index + 1),
            color: '#ffffff',
            fontSize: '10px',
            fontWeight: 'bold',
          },
          title: point.name,
        });
        markersRef.current.push(marker);
      }
    });
  }, [pickupPoints]);

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div 
        className={`bg-gradient-to-br from-indigo-100 to-emerald-50 rounded-xl flex items-center justify-center border border-border ${className}`}
        style={{ height }}
      >
        <div className="text-center p-4">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">Map unavailable</p>
          <p className="text-xs text-muted-foreground">API key not configured</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className={`bg-gradient-to-br from-indigo-100 to-emerald-50 rounded-xl flex items-center justify-center border border-border ${className}`}
        style={{ height }}
      >
        <div className="text-center p-4">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden border border-border ${className}`} style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-emerald-50 flex items-center justify-center z-10">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">Loading map...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Map legend */}
      {(resolvedOrigin || resolvedDestination || driverLocation) && (
        <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-2 text-xs space-y-1 shadow-lg">
          {resolvedOrigin && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 border border-white" />
              <span>Origin</span>
            </div>
          )}
          {resolvedDestination && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 border border-white" />
              <span>Destination</span>
            </div>
          )}
          {driverLocation && (
            <div className="flex items-center gap-2">
              <Navigation className="w-3 h-3 text-blue-500" />
              <span>Driver</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
