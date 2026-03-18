'use client';
import { useState } from 'react';
import { Share2, MessageCircle, Copy, Check, Facebook, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from '@/hooks/use-toast';

interface ShareRideProps {
  rideId: string;
  origin: string;
  destination: string;
  departureTime: string;
  price: number;
}

export function ShareRide({ rideId, origin, destination, departureTime, price }: ShareRideProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  
  const rideUrl = `${window.location.origin}/rides/${rideId}`;
  const shareText = `🚗 Ride from ${origin} to ${destination}\n📅 ${new Date(departureTime).toLocaleDateString()}\n💰 ₹${price}/seat\n\nBook now on Trapy!`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(rideUrl);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(rideUrl);
      setCopied(true);
      toast({
        title: t('ride.linkCopied'),
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Failed to copy',
        variant: 'destructive',
      });
    }
  };

  const handleWhatsAppShare = () => {
    window.open(`https://wa.me/?text=${encodedText}%0A${encodedUrl}`, '_blank');
  };

  const handleTwitterShare = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank');
  };

  const handleFacebookShare = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ride: ${origin} → ${destination}`,
          text: shareText,
          url: rideUrl,
        });
      } catch {
        // User cancelled or error
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          {t('common.share')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleWhatsAppShare} className="gap-2 cursor-pointer">
          <MessageCircle className="w-4 h-4 text-green-600" />
          {t('ride.shareWhatsApp')}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleTwitterShare} className="gap-2 cursor-pointer">
          <Twitter className="w-4 h-4 text-blue-400" />
          Twitter
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleFacebookShare} className="gap-2 cursor-pointer">
          <Facebook className="w-4 h-4 text-blue-600" />
          Facebook
        </DropdownMenuItem>
        
        {navigator.share && (
          <DropdownMenuItem onClick={handleNativeShare} className="gap-2 cursor-pointer">
            <Share2 className="w-4 h-4" />
            More...
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={handleCopyLink} className="gap-2 cursor-pointer">
          {copied ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          {t('ride.copyLink')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
