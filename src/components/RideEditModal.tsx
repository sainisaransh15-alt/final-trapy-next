'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RideEditModalProps {
  ride: {
    id: string;
    origin: string;
    destination: string;
    departure_time: string;
    seats_available: number;
    price_per_seat: number;
    car_model: string | null;
    car_number: string | null;
    is_women_only: boolean | null;
    is_pet_friendly: boolean | null;
    is_smoking_allowed: boolean | null;
    is_music_allowed: boolean | null;
    instant_approval: boolean | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export default function RideEditModal({ ride, open, onOpenChange, onSave }: RideEditModalProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    seats_available: ride.seats_available,
    price_per_seat: ride.price_per_seat,
    car_model: ride.car_model || '',
    car_number: ride.car_number || '',
    is_pet_friendly: ride.is_pet_friendly || false,
    is_smoking_allowed: ride.is_smoking_allowed || false,
    is_music_allowed: ride.is_music_allowed !== false,
    instant_approval: ride.instant_approval || false,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('rides')
        .update({
          seats_available: form.seats_available,
          price_per_seat: form.price_per_seat,
          car_model: form.car_model || null,
          car_number: form.car_number || null,
          is_pet_friendly: form.is_pet_friendly,
          is_smoking_allowed: form.is_smoking_allowed,
          is_music_allowed: form.is_music_allowed,
          instant_approval: form.instant_approval,
        })
        .eq('id', ride.id);

      if (error) throw error;

      toast({
        title: 'Ride updated',
        description: 'Your ride has been updated successfully.',
      });

      onSave();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update ride. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Ride</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Route Info (read-only) */}
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Route</p>
            <p className="font-medium">{ride.origin} → {ride.destination}</p>
          </div>

          {/* Seats */}
          <div className="space-y-2">
            <Label>Available Seats</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setForm(f => ({ ...f, seats_available: Math.max(1, f.seats_available - 1) }))}
              >
                -
              </Button>
              <span className="w-8 text-center font-bold text-xl">{form.seats_available}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setForm(f => ({ ...f, seats_available: Math.min(8, f.seats_available + 1) }))}
              >
                +
              </Button>
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Price per Seat (₹)</Label>
            <Input
              id="price"
              type="number"
              value={form.price_per_seat}
              onChange={(e) => setForm(f => ({ ...f, price_per_seat: Number(e.target.value) }))}
              min={1}
            />
          </div>

          {/* Car Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="car_model">Car Model</Label>
              <Input
                id="car_model"
                value={form.car_model}
                onChange={(e) => setForm(f => ({ ...f, car_model: e.target.value }))}
                placeholder="e.g., Swift"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="car_number">Car Number</Label>
              <Input
                id="car_number"
                value={form.car_number}
                onChange={(e) => setForm(f => ({ ...f, car_number: e.target.value.toUpperCase() }))}
                placeholder="e.g., MH 12 AB 1234"
              />
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-4">
            <h3 className="font-medium">Preferences</h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="instant_approval" className="cursor-pointer">Instant Approval ⚡</Label>
              <Switch
                id="instant_approval"
                checked={form.instant_approval}
                onCheckedChange={(checked) => setForm(f => ({ ...f, instant_approval: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="pet_friendly" className="cursor-pointer">Pet Friendly</Label>
              <Switch
                id="pet_friendly"
                checked={form.is_pet_friendly}
                onCheckedChange={(checked) => setForm(f => ({ ...f, is_pet_friendly: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="smoking" className="cursor-pointer">Smoking Allowed</Label>
              <Switch
                id="smoking"
                checked={form.is_smoking_allowed}
                onCheckedChange={(checked) => setForm(f => ({ ...f, is_smoking_allowed: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="music" className="cursor-pointer">Music Allowed</Label>
              <Switch
                id="music"
                checked={form.is_music_allowed}
                onCheckedChange={(checked) => setForm(f => ({ ...f, is_music_allowed: checked }))}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
