'use client';
import { useState } from 'react';
import { Shield, Phone, Share2, MapPin, AlertTriangle, Loader2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import TrustedContacts from './TrustedContacts';

interface SafetyMenuProps {
  open: boolean;
  onClose: () => void;
  rideId?: string;
  bookingId?: string;
}

export default function SafetyMenu({ open, onClose, rideId, bookingId }: SafetyMenuProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [showContacts, setShowContacts] = useState(false);

  const logSOSAlert = async (alertType: 'sos' | 'share_location' | 'share_ride') => {
    if (!user) return;
    
    setLoading(alertType);
    try {
      // Try to get current location
      let latitude: number | null = null;
      let longitude: number | null = null;
      
      if ('geolocation' in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        } catch {
          // Location not available, continue without it
        }
      }

      const { error } = await supabase.from('sos_alerts').insert({
        user_id: user.id,
        ride_id: rideId || null,
        booking_id: bookingId || null,
        alert_type: alertType,
        latitude,
        longitude,
      });

      if (error) throw error;

      toast({
        title: alertType === 'sos' ? 'SOS Alert Logged' : 'Location Shared',
        description: 'Your safety action has been recorded.',
      });
    } catch (error) {
      console.error('Error logging SOS:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleShareRide = async () => {
    await logSOSAlert('share_ride');
    
    const shareData = {
      title: 'My Trapy Ride',
      text: `I'm on a Trapy ride. Track my journey for safety.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or share failed
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link Copied',
        description: 'Ride link copied to clipboard. Share it with your contacts.',
      });
    }
  };

  const handleShareLocation = async () => {
    await logSOSAlert('share_location');
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
          
          if (navigator.share) {
            navigator.share({
              title: 'My Live Location',
              text: 'Here is my current location',
              url: mapsUrl,
            });
          } else {
            navigator.clipboard.writeText(mapsUrl);
            toast({
              title: 'Location Copied',
              description: 'Location link copied to clipboard.',
            });
          }
        },
        () => {
          toast({
            title: 'Location Unavailable',
            description: 'Please enable location access in your browser settings.',
            variant: 'destructive',
          });
        }
      );
    }
  };

  const handleSOS = async (number: string) => {
    await logSOSAlert('sos');
    window.open(`tel:${number}`);
  };

  const safetyActions = [
    {
      icon: Share2,
      label: 'Share Ride Details',
      description: 'Send your trip info to trusted contacts',
      action: handleShareRide,
      key: 'share_ride',
    },
    {
      icon: Phone,
      label: 'Call Police (100)',
      description: 'Connect to emergency services',
      action: () => handleSOS('100'),
      emergency: true,
      key: 'sos',
    },
    {
      icon: Phone,
      label: 'Women Helpline (181)',
      description: '24x7 Women Safety Helpline',
      action: () => handleSOS('181'),
      key: 'women',
    },
    {
      icon: MapPin,
      label: 'Share Live Location',
      description: 'Let contacts track your journey',
      action: handleShareLocation,
      key: 'share_location',
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-y-auto">
        <SheetHeader className="text-left pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-light flex items-center justify-center">
              <Shield className="w-6 h-6 text-emerald" />
            </div>
            <div>
              <SheetTitle className="text-xl">Safety Shield</SheetTitle>
              <p className="text-sm text-muted-foreground">Your safety is our priority</p>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-3 pb-6">
          {safetyActions.map((action) => (
            <button
              key={action.key}
              onClick={action.action}
              disabled={loading === action.key}
              className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[0.99] active:scale-[0.97] ${
                action.emergency
                  ? 'bg-destructive/10 hover:bg-destructive/20 border border-destructive/20'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  action.emergency ? 'bg-destructive/20' : 'bg-emerald-light'
                }`}
              >
                {loading === action.key ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <action.icon
                    className={`w-5 h-5 ${
                      action.emergency ? 'text-destructive' : 'text-emerald'
                    }`}
                  />
                )}
              </div>
              <div className="text-left">
                <p className={`font-semibold ${action.emergency ? 'text-destructive' : ''}`}>
                  {action.label}
                </p>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Trusted Contacts Section */}
        {user && (
          <div className="border-t border-border pt-4 pb-6">
            <button
              onClick={() => setShowContacts(!showContacts)}
              className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-xl mb-4"
            >
              <div className="flex items-center gap-3">
                <UserPlus className="w-5 h-5 text-primary" />
                <span className="font-medium">Manage Trusted Contacts</span>
              </div>
            </button>
            {showContacts && <TrustedContacts />}
          </div>
        )}

        <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            In an emergency, always prioritize your safety. Move to a safe location and call for help immediately.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
