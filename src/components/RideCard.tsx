'use client';
import Link from 'next/link';
import { Star, Shield, Zap, PawPrint, Users, Clock, MapPin, Car } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns';

interface RideWithDriver {
  id: string;
  origin: string;
  destination: string;
  departure_time: string;
  seats_available: number;
  price_per_seat: number;
  distance_km?: number | null;
  car_model?: string | null;
  is_women_only: boolean | null;
  is_pet_friendly: boolean | null;
  instant_approval?: boolean | null;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
    rating: number | null;
    total_rides: number | null;
    is_dl_verified: boolean | null;
    is_phone_verified: boolean | null;
    gender?: string | null;
  } | null;
}

interface RideCardProps {
  ride: RideWithDriver;
}

export default function RideCard({ ride }: RideCardProps) {
  const departureDate = new Date(ride.departure_time);
  const formattedTime = format(departureDate, 'h:mm a');
  
  // Smart date formatting
  const getDateLabel = () => {
    if (isToday(departureDate)) return 'Today';
    if (isTomorrow(departureDate)) return 'Tomorrow';
    return format(departureDate, 'EEE, MMM d');
  };

  // Extract city name (remove state/country)
  const getShortLocation = (location: string) => {
    return location.split(',')[0].trim();
  };

  return (
    <Link href={`/ride/${ride.id}`}>
      <div className="bg-card border border-border rounded-xl p-4 hover:shadow-soft transition-all hover:border-primary/20 cursor-pointer group">
        <div className="flex gap-4">
          {/* Timeline */}
          <div className="flex flex-col items-center py-1">
            <div className="w-3 h-3 rounded-full bg-primary group-hover:scale-110 transition-transform" />
            <div className="w-0.5 flex-1 bg-gradient-to-b from-primary to-primary/30 my-1" />
            <div className="w-3 h-3 rounded-full border-2 border-primary bg-background group-hover:scale-110 transition-transform" />
          </div>

          {/* Ride Details */}
          <div className="flex-1 min-w-0">
            {/* Times and Locations */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-lg">{formattedTime}</p>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {getDateLabel()}
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate">{getShortLocation(ride.origin)}</p>
                </div>
                {ride.instant_approval && (
                  <Badge variant="secondary" className="bg-warning/10 text-warning border-0 shrink-0">
                    <Zap className="w-3 h-3 mr-1" />
                    Instant
                  </Badge>
                )}
              </div>

              <div>
                <p className="text-sm font-medium truncate">{getShortLocation(ride.destination)}</p>
                {ride.distance_km && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {ride.distance_km} km • ~{Math.round(ride.distance_km / 50 * 60)} min
                  </p>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border my-4" />

            {/* Driver Info and Price */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {ride.profiles?.avatar_url ? (
                    <img
                      src={ride.profiles.avatar_url}
                      alt={ride.profiles.full_name || 'Driver'}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-background"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-background">
                      <span className="text-primary font-semibold">
                        {ride.profiles?.full_name?.charAt(0)?.toUpperCase() || 'D'}
                      </span>
                    </div>
                  )}
                  {ride.profiles?.is_dl_verified && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald rounded-full flex items-center justify-center border-2 border-background">
                      <Shield className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{ride.profiles?.full_name || 'Driver'}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-warning text-warning" />
                    <span className="text-xs font-medium">
                      {ride.profiles?.rating ? ride.profiles.rating.toFixed(1) : 'New'}
                    </span>
                    {ride.profiles?.total_rides ? (
                      <span className="text-xs text-muted-foreground">
                        • {ride.profiles.total_rides} ride{ride.profiles.total_rides !== 1 ? 's' : ''}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-primary">₹{ride.price_per_seat}</p>
                <p className="text-xs text-muted-foreground">per seat</p>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              {ride.is_women_only && (
                <Badge variant="secondary" className="bg-pink-100 text-pink-700 border-0">
                  <Users className="w-3 h-3 mr-1" />
                  Women Only
                </Badge>
              )}
              {ride.is_pet_friendly && (
                <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-0">
                  <PawPrint className="w-3 h-3 mr-1" />
                  Pet Friendly
                </Badge>
              )}
              {ride.car_model && (
                <Badge variant="outline" className="text-muted-foreground">
                  <Car className="w-3 h-3 mr-1" />
                  {ride.car_model}
                </Badge>
              )}
              <Badge 
                variant="outline" 
                className={`${
                  ride.seats_available <= 2 
                    ? 'text-destructive border-destructive/30' 
                    : 'text-muted-foreground'
                }`}
              >
                {ride.seats_available} seat{ride.seats_available !== 1 ? 's' : ''} left
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
