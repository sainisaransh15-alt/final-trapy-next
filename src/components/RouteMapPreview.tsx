'use client';
import { useState, useEffect } from 'react';
import { MapPin, Clock, Navigation } from 'lucide-react';
import GoogleMap from './GoogleMap';
import { formatDuration } from '@/lib/googleMaps';

interface RouteMapPreviewProps {
  origin: string;
  destination: string;
  height?: string;
  onDistanceCalculated?: (distanceKm: number, durationMins: number) => void;
  showInfo?: boolean;
  className?: string;
}

export default function RouteMapPreview({
  origin,
  destination,
  height = '200px',
  onDistanceCalculated,
  showInfo = true,
  className = '',
}: RouteMapPreviewProps) {
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);

  const handleDistanceCalculated = (distanceKm: number, durationMins: number) => {
    setRouteInfo({ distance: distanceKm, duration: durationMins });
    onDistanceCalculated?.(distanceKm, durationMins);
  };

  const shouldShowRoute = origin && destination && origin !== destination;

  return (
    <div className={`space-y-3 ${className}`}>
      <GoogleMap
        origin={origin}
        destination={destination}
        showRoute={shouldShowRoute}
        onDistanceCalculated={handleDistanceCalculated}
        height={height}
      />
      
      {showInfo && routeInfo && (
        <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm">
              <Navigation className="w-4 h-4 text-primary" />
              <span className="font-medium">{routeInfo.distance} km</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{formatDuration(routeInfo.duration)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>{origin}</span>
            </div>
            <span>→</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span>{destination}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
