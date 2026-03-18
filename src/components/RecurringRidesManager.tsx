'use client';
import { useState, useEffect } from 'react';
import { 
  Repeat, Calendar, Clock, MapPin, Trash2, Loader2, 
  Plus, Pause, Play, Edit2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface RecurringRide {
  id: string;
  origin: string;
  destination: string;
  departure_time: string;
  price_per_seat: number;
  seats_available: number;
  recurrence_type: string;
  recurrence_days: number[];
  is_active: boolean;
  next_publish_date: string | null;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export default function RecurringRidesManager() {
  const { user } = useAuth();
  const [rides, setRides] = useState<RecurringRide[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [price, setPrice] = useState(400);
  const [seats, setSeats] = useState(3);
  const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 3, 5]); // Mon, Wed, Fri

  useEffect(() => {
    if (user) fetchRecurringRides();
  }, [user]);

  const fetchRecurringRides = async () => {
    try {
      const { data, error } = await supabase
        .from('recurring_rides')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRides(data || []);
    } catch (error) {
      console.error('Error fetching recurring rides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecurringRide = async () => {
    if (!user || !origin || !destination || !departureTime) return;

    setSaving(true);
    try {
      const { error } = await supabase.from('recurring_rides').insert({
        driver_id: user.id,
        origin,
        destination,
        departure_time: departureTime,
        price_per_seat: price,
        seats_available: seats,
        recurrence_type: recurrenceType,
        recurrence_days: recurrenceType === 'weekly' ? selectedDays : [],
        is_active: true,
      });

      if (error) throw error;

      toast({
        title: 'Recurring Ride Created',
        description: 'Your ride schedule has been saved.',
      });

      resetForm();
      setDialogOpen(false);
      fetchRecurringRides();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create recurring ride',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('recurring_rides')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;

      setRides(prev =>
        prev.map(r => (r.id === id ? { ...r, is_active: !isActive } : r))
      );

      toast({
        title: !isActive ? 'Schedule Activated' : 'Schedule Paused',
        description: !isActive 
          ? 'Rides will be auto-published on schedule.'
          : 'Auto-publishing paused.',
      });
    } catch (error) {
      console.error('Error toggling recurring ride:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this recurring ride schedule?')) return;

    try {
      const { error } = await supabase
        .from('recurring_rides')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setRides(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting recurring ride:', error);
    }
  };

  const toggleDay = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  const resetForm = () => {
    setOrigin('');
    setDestination('');
    setDepartureTime('');
    setPrice(400);
    setSeats(3);
    setRecurrenceType('weekly');
    setSelectedDays([1, 3, 5]);
  };

  const formatDays = (days: number[]) => {
    return days.map(d => DAYS_OF_WEEK.find(day => day.value === d)?.label).join(', ');
  };

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Repeat className="w-5 h-5 text-primary" />
            Recurring Rides
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Recurring Ride</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>From</Label>
                    <Input
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      placeholder="Mumbai"
                    />
                  </div>
                  <div>
                    <Label>To</Label>
                    <Input
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="Pune"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Departure Time</Label>
                    <Input
                      type="time"
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Price (₹)</Label>
                    <Input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      min={50}
                    />
                  </div>
                </div>

                <div>
                  <Label>Seats Available</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSeats(Math.max(1, seats - 1))}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center font-bold">{seats}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSeats(Math.min(7, seats + 1))}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Repeat</Label>
                  <Select
                    value={recurrenceType}
                    onValueChange={(v) => setRecurrenceType(v as any)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {recurrenceType === 'weekly' && (
                  <div>
                    <Label>Days of Week</Label>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {DAYS_OF_WEEK.map((day) => (
                        <Button
                          key={day.value}
                          variant={selectedDays.includes(day.value) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleDay(day.value)}
                        >
                          {day.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleCreateRecurringRide}
                  disabled={saving || !origin || !destination || !departureTime}
                  className="w-full"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Repeat className="w-4 h-4 mr-2" />
                  )}
                  Create Schedule
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : rides.length === 0 ? (
          <div className="text-center py-8 bg-muted/50 rounded-xl">
            <Repeat className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No recurring rides yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Create a schedule for regular routes
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {rides.map((ride) => (
              <div
                key={ride.id}
                className={`border rounded-lg p-4 transition-colors ${
                  ride.is_active ? 'bg-card' : 'bg-muted/50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="font-medium">{ride.origin}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-medium">{ride.destination}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {ride.departure_time.slice(0, 5)}
                      </span>
                      <span>₹{ride.price_per_seat}/seat</span>
                      <span>{ride.seats_available} seats</span>
                    </div>
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {ride.recurrence_type === 'weekly'
                          ? formatDays(ride.recurrence_days || [])
                          : ride.recurrence_type}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={ride.is_active}
                      onCheckedChange={() => handleToggleActive(ride.id, ride.is_active)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(ride.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
