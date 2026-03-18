'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Calendar,
  Users,
  ArrowRight,
  ArrowLeft,
  Search,
  IndianRupee,
  PawPrint,
  Zap,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { indianCities } from '@/lib/mockData';
import { format } from 'date-fns';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/hooks/useAuth';

export default function FindRide() {
  const router = useRouter();
  const { setSearchParams } = useApp();
  const { profile } = useAuth();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Form state
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [passengers, setPassengers] = useState(1);
  const [maxPrice, setMaxPrice] = useState(2000);
  const [timePreference, setTimePreference] = useState<string[]>([]);
  const [womenOnly, setWomenOnly] = useState(false);
  const [petFriendly, setPetFriendly] = useState(false);
  const [instantApproval, setInstantApproval] = useState(false);

  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  const filteredFromCities = indianCities.filter((city) =>
    city.toLowerCase().includes(from.toLowerCase())
  );
  const filteredToCities = indianCities.filter((city) =>
    city.toLowerCase().includes(to.toLowerCase())
  );

  const timeSlots = [
    { id: 'early', label: '6am - 9am', icon: '🌅' },
    { id: 'morning', label: '9am - 12pm', icon: '☀️' },
    { id: 'afternoon', label: '12pm - 6pm', icon: '🌤️' },
    { id: 'evening', label: '6pm - 10pm', icon: '🌙' },
  ];

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSearch();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSearch = () => {
    setSearchParams({
      from,
      to,
      date: date ? format(date, 'yyyy-MM-dd') : '',
      passengers,
    });
    // Navigate with additional filters as URL params
    const params = new URLSearchParams();
    if (maxPrice < 2000) params.set('maxPrice', maxPrice.toString());
    if (timePreference.length > 0) params.set('time', timePreference.join(','));
    if (womenOnly) params.set('womenOnly', 'true');
    if (petFriendly) params.set('petFriendly', 'true');
    if (instantApproval) params.set('instant', 'true');
    
    router.push(`/search${params.toString() ? '?' + params.toString() : ''}`);
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return from && to && from !== to;
      case 2:
        return date !== undefined;
      case 3:
        return passengers > 0 && passengers <= 7;
      case 4:
        return true; // Preferences are optional
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 pt-16">
      <div className="container px-4 py-8">
        <div className="max-w-xl mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Step {step} of {totalSteps}</span>
              <span className="text-sm font-medium">{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
            {/* Step 1: Route */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-light flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Where do you want to go?</h2>
                  <p className="text-muted-foreground">Enter your travel route</p>
                </div>

                <div>
                  <Label className="mb-2 block">Leaving from</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                    <Input
                      placeholder="Enter city"
                      value={from}
                      onChange={(e) => {
                        setFrom(e.target.value);
                        setFromOpen(true);
                      }}
                      onFocus={() => setFromOpen(true)}
                      onBlur={() => setTimeout(() => setFromOpen(false), 150)}
                      className="pl-10 h-12"
                      autoComplete="off"
                    />
                    {fromOpen && from && filteredFromCities.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {filteredFromCities.slice(0, 6).map((city) => (
                          <button
                            key={city}
                            type="button"
                            className="w-full px-4 py-3 text-left hover:bg-muted transition-colors"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setFrom(city);
                              setFromOpen(false);
                            }}
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Going to</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary z-10" />
                    <Input
                      placeholder="Enter city"
                      value={to}
                      onChange={(e) => {
                        setTo(e.target.value);
                        setToOpen(true);
                      }}
                      onFocus={() => setToOpen(true)}
                      onBlur={() => setTimeout(() => setToOpen(false), 150)}
                      className="pl-10 h-12"
                      autoComplete="off"
                    />
                    {toOpen && to && filteredToCities.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {filteredToCities.slice(0, 6).map((city) => (
                          <button
                            key={city}
                            type="button"
                            className="w-full px-4 py-3 text-left hover:bg-muted transition-colors"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setTo(city);
                              setToOpen(false);
                            }}
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {from && to && from !== to && (
                  <div className="bg-muted/50 rounded-xl p-4 text-center">
                    <p className="text-sm text-muted-foreground">Your route</p>
                    <p className="font-semibold text-lg">
                      {from.split(',')[0]} → {to.split(',')[0]}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Date */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-light flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold">When are you traveling?</h2>
                  <p className="text-muted-foreground">Select your travel date</p>
                </div>

                <div className="flex justify-center">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date()}
                    className="rounded-xl border border-border"
                  />
                </div>

                {date && (
                  <div className="bg-muted/50 rounded-xl p-4 text-center">
                    <p className="text-sm text-muted-foreground">Selected date</p>
                    <p className="font-semibold text-lg">
                      {format(date, 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                )}

                {/* Time Preference (Optional) */}
                <div>
                  <Label className="mb-3 block">Preferred time (optional)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map((slot) => (
                      <Button
                        key={slot.id}
                        type="button"
                        variant={timePreference.includes(slot.id) ? 'default' : 'outline'}
                        className="h-12 justify-start"
                        onClick={() => {
                          if (timePreference.includes(slot.id)) {
                            setTimePreference(timePreference.filter(t => t !== slot.id));
                          } else {
                            setTimePreference([...timePreference, slot.id]);
                          }
                        }}
                      >
                        <span className="mr-2">{slot.icon}</span>
                        {slot.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Passengers */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold">How many seats?</h2>
                  <p className="text-muted-foreground">Select the number of passengers</p>
                </div>

                <div className="flex items-center justify-center gap-6">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-14 w-14 rounded-full text-2xl"
                    onClick={() => setPassengers(Math.max(1, passengers - 1))}
                    disabled={passengers <= 1}
                  >
                    -
                  </Button>
                  <div className="text-center">
                    <span className="text-5xl font-bold">{passengers}</span>
                    <p className="text-muted-foreground mt-1">
                      {passengers === 1 ? 'passenger' : 'passengers'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-14 w-14 rounded-full text-2xl"
                    onClick={() => setPassengers(Math.min(7, passengers + 1))}
                    disabled={passengers >= 7}
                  >
                    +
                  </Button>
                </div>

                {/* Max Price */}
                <div className="pt-6 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="flex items-center gap-2">
                      <IndianRupee className="w-4 h-4" />
                      Maximum budget per seat
                    </Label>
                    <span className="text-lg font-bold text-primary">
                      {maxPrice >= 2000 ? 'Any' : `₹${maxPrice}`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="100"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>₹100</span>
                    <span>₹500</span>
                    <span>₹1000</span>
                    <span>Any</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Preferences */}
            {step === 4 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold">Any preferences?</h2>
                  <p className="text-muted-foreground">Filter rides to match your needs</p>
                </div>

                <div className="space-y-4">
                  {profile?.gender === 'female' && (
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                          <Users className="w-5 h-5 text-pink-600" />
                        </div>
                        <div>
                          <Label className="font-medium">Women Only</Label>
                          <p className="text-sm text-muted-foreground">Rides with female drivers</p>
                        </div>
                      </div>
                      <Switch checked={womenOnly} onCheckedChange={setWomenOnly} />
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <PawPrint className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <Label className="font-medium">Pet Friendly</Label>
                        <p className="text-sm text-muted-foreground">Traveling with a pet?</p>
                      </div>
                    </div>
                    <Switch checked={petFriendly} onCheckedChange={setPetFriendly} />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <Label className="font-medium">Instant Approval</Label>
                        <p className="text-sm text-muted-foreground">Book without waiting</p>
                      </div>
                    </div>
                    <Switch checked={instantApproval} onCheckedChange={setInstantApproval} />
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mt-6">
                  <h3 className="font-semibold mb-3">Your search</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Route</span>
                      <span className="font-medium">{from.split(',')[0]} → {to.split(',')[0]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-medium">{date ? format(date, 'MMM d, yyyy') : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Passengers</span>
                      <span className="font-medium">{passengers}</span>
                    </div>
                    {maxPrice < 2000 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max price</span>
                        <span className="font-medium">₹{maxPrice}/seat</span>
                      </div>
                    )}
                    {timePreference.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time</span>
                        <span className="font-medium">
                          {timePreference.map(t => timeSlots.find(s => s.id === t)?.label).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="gap-2"
              >
                {step === totalSteps ? (
                  <>
                    <Search className="w-4 h-4" />
                    Find Rides
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Quick tips */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {step === 1 && "💡 Popular routes: Delhi-Jaipur, Mumbai-Pune, Bangalore-Chennai"}
            {step === 2 && "💡 Booking in advance gets you better prices"}
            {step === 3 && "💡 Sharing with more passengers means lower costs"}
            {step === 4 && "💡 You can refine your search anytime on the results page"}
          </div>
        </div>
      </div>
    </div>
  );
}
