'use client';
import { useState, useEffect, useCallback } from 'react';
import { Filter, SlidersHorizontal, X, Users, PawPrint, Zap, Loader2, Car, Map, List, CalendarDays, MapPin, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SearchWidget from '@/components/SearchWidget';
import RideCard from '@/components/RideCard';
import { RideCardSkeleton, RideListSkeleton } from '@/components/skeletons';
import { NoRidesFound } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { retryAsync, handleError } from '@/lib/errorHandling';
import SearchMapView from '@/components/SearchMapView';
import { format, addDays, parseISO, startOfDay, endOfDay } from 'date-fns';

interface RideWithDriver {
  id: string;
  origin: string;
  destination: string;
  departure_time: string;
  seats_available: number;
  price_per_seat: number;
  distance_km: number | null;
  car_model: string | null;
  car_number: string | null;
  is_women_only: boolean | null;
  is_pet_friendly: boolean | null;
  is_smoking_allowed: boolean | null;
  is_music_allowed: boolean | null;
  is_chatty: boolean | null;
  max_two_back_seat: boolean | null;
  instant_approval: boolean | null;
  driver_id: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
    rating: number | null;
    total_rides: number | null;
    is_dl_verified: boolean | null;
    is_phone_verified: boolean | null;
    gender: string | null;
  } | null;
}

export default function Search() {
  const { searchParams, setSearchParams } = useApp();
  const { profile } = useAuth();
  const [maxPrice, setMaxPrice] = useState(2000);
  const [sliderValue, setSliderValue] = useState(2000);
  const [departureTime, setDepartureTime] = useState<string[]>([]);
  const [womenOnly, setWomenOnly] = useState(false);
  const [petFriendly, setPetFriendly] = useState(false);
  const [instantApproval, setInstantApproval] = useState(false);
  const [sortBy, setSortBy] = useState<'departure_time' | 'price' | 'rating'>('departure_time');
  const [rides, setRides] = useState<RideWithDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [totalCount, setTotalCount] = useState(0);
  const [alternativeDates, setAlternativeDates] = useState<{ date: string; count: number }[]>([]);
  const PAGE_SIZE = 10;

  // Debounce slider to avoid too many re-renders
  useEffect(() => {
    const timer = setTimeout(() => {
      setMaxPrice(sliderValue);
    }, 150);
    return () => clearTimeout(timer);
  }, [sliderValue]);

  useEffect(() => {
    setPage(1);
    setRides([]);
    fetchRides(1, true);
    // Also check for alternative dates if search has a specific date
    if (searchParams.date && searchParams.from && searchParams.to) {
      fetchAlternativeDates();
    }
  }, [searchParams, profile]);

  // Fetch alternative dates when no results
  const fetchAlternativeDates = async () => {
    try {
      const searchDate = searchParams.date ? parseISO(searchParams.date) : new Date();
      const dates: { date: string; count: number }[] = [];
      
      // Check 3 days before and 3 days after
      for (let i = -3; i <= 3; i++) {
        if (i === 0) continue;
        const checkDate = addDays(searchDate, i);
        if (checkDate < new Date()) continue;
        
        const dayStart = startOfDay(checkDate).toISOString();
        const dayEnd = endOfDay(checkDate).toISOString();
        
        let query = supabase
          .from('rides')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active')
          .gt('seats_available', 0)
          .gte('departure_time', dayStart)
          .lt('departure_time', dayEnd);
        
        if (searchParams.from) {
          query = query.ilike('origin', `%${searchParams.from}%`);
        }
        if (searchParams.to) {
          query = query.ilike('destination', `%${searchParams.to}%`);
        }
        
        const { count } = await query;
        if (count && count > 0) {
          dates.push({ date: format(checkDate, 'yyyy-MM-dd'), count });
        }
      }
      
      setAlternativeDates(dates);
    } catch (err) {
      console.error('Failed to fetch alternative dates', err);
    }
  };

  const fetchRides = async (pageNum: number = 1, reset: boolean = false) => {
    if (reset) setLoading(true);
    setError(null);
    try {
      await retryAsync(async () => {
        const from = (pageNum - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        let query = supabase
          .from('rides')
          .select(`
            *,
            profiles!rides_driver_id_fkey (
              full_name,
              avatar_url,
              rating,
              total_rides,
              is_dl_verified,
              is_phone_verified,
              gender
            )
          `, { count: 'exact' })
          .eq('status', 'active')
          .gt('seats_available', 0)
          .range(from, to);

        // Filter by minimum seats required
        if (searchParams.passengers && searchParams.passengers > 1) {
          query = query.gte('seats_available', searchParams.passengers);
        }

        // Filter by date - if date is provided, search that specific day
        if (searchParams.date) {
          const searchDate = parseISO(searchParams.date);
          const dayStart = startOfDay(searchDate).toISOString();
          const dayEnd = endOfDay(searchDate).toISOString();
          query = query.gte('departure_time', dayStart).lt('departure_time', dayEnd);
        } else {
          // No date specified - show future rides only
          query = query.gte('departure_time', new Date().toISOString());
        }

        // Filter by origin/destination if provided (case-insensitive partial match)
        if (searchParams.from) {
          // Support multiple formats: "Mumbai", "Mumbai, Maharashtra", etc.
          const originSearch = searchParams.from.split(',')[0].trim();
          query = query.ilike('origin', `%${originSearch}%`);
        }
        if (searchParams.to) {
          const destSearch = searchParams.to.split(',')[0].trim();
          query = query.ilike('destination', `%${destSearch}%`);
        }

        const { data, error: queryError, count } = await query.order('departure_time', { ascending: true });

        if (queryError) throw queryError;

        // Filter women-only rides based on user gender
        let filteredData = data as RideWithDriver[];
        if (profile?.gender !== 'female') {
          filteredData = filteredData.filter(ride => !ride.is_women_only);
        }

        if (reset) {
          setRides(filteredData);
          setTotalCount(count || 0);
        } else {
          setRides(prev => [...prev, ...filteredData]);
        }
        
        setHasMore(filteredData.length === PAGE_SIZE);
      }, {
        maxRetries: 2,
        retryDelay: 1000,
      });
    } catch (error: any) {
      setError(error.message || 'Failed to fetch rides. Please try again.');
      handleError(error, 'Failed to load rides. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchRides(nextPage);
  };

  const timeSlots = [
    { id: 'early', label: '6am - 9am', start: 6, end: 9 },
    { id: 'morning', label: '9am - 12pm', start: 9, end: 12 },
    { id: 'afternoon', label: '12pm - 6pm', start: 12, end: 18 },
    { id: 'evening', label: '6pm - 10pm', start: 18, end: 22 },
  ];

  const isInTimeSlot = (departureTime: string, slotIds: string[]) => {
    if (slotIds.length === 0) return true;
    const hour = new Date(departureTime).getHours();
    return slotIds.some(slotId => {
      const slot = timeSlots.find(s => s.id === slotId);
      return slot && hour >= slot.start && hour < slot.end;
    });
  };

  const filteredRides = rides
    .filter((ride) => {
      if (maxPrice < 2000 && ride.price_per_seat > maxPrice) return false;
      if (womenOnly && !ride.is_women_only) return false;
      if (petFriendly && !ride.is_pet_friendly) return false;
      if (instantApproval && !(ride as any).instant_approval) return false;
      if (!isInTimeSlot(ride.departure_time, departureTime)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price') {
        return a.price_per_seat - b.price_per_seat;
      }
      if (sortBy === 'rating') {
        return (b.profiles?.rating || 0) - (a.profiles?.rating || 0);
      }
      return new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime();
    });

  // Active filters count for badge
  const activeFiltersCount = [
    maxPrice < 2000,
    departureTime.length > 0,
    womenOnly,
    petFriendly,
    instantApproval,
  ].filter(Boolean).length;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price Slider - Simple Max Price */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-base font-semibold">Max Price</Label>
          <span className="text-lg font-bold text-primary">
            {sliderValue >= 2000 ? 'Any' : `₹${sliderValue}`}
          </span>
        </div>
        <input
          type="range"
          min="100"
          max="2000"
          step="100"
          value={sliderValue}
          onChange={(e) => setSliderValue(Number(e.target.value))}
          className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>₹100</span>
          <span>₹500</span>
          <span>₹1000</span>
          <span>Any</span>
        </div>
      </div>

      {/* Departure Time */}
      <div>
        <Label className="text-base font-semibold mb-4 block">Departure Time</Label>
        <div className="grid grid-cols-2 gap-2">
          {timeSlots.map((slot) => (
            <Button
              key={slot.id}
              variant={departureTime.includes(slot.id) ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (departureTime.includes(slot.id)) {
                  setDepartureTime(departureTime.filter((t) => t !== slot.id));
                } else {
                  setDepartureTime([...departureTime, slot.id]);
                }
              }}
            >
              {slot.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-4">
        {profile?.gender === 'female' && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-pink-500" />
              <Label htmlFor="women-only">Women Only</Label>
            </div>
            <Switch id="women-only" checked={womenOnly} onCheckedChange={setWomenOnly} />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PawPrint className="w-4 h-4 text-muted-foreground" />
            <Label htmlFor="pet-friendly">Pet Friendly</Label>
          </div>
          <Switch id="pet-friendly" checked={petFriendly} onCheckedChange={setPetFriendly} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-warning" />
            <Label htmlFor="instant-approval">Instant Approval</Label>
          </div>
          <Switch id="instant-approval" checked={instantApproval} onCheckedChange={setInstantApproval} />
        </div>
      </div>

      {/* Sort By */}
      <div>
        <Label className="text-base font-semibold mb-4 block">Sort By</Label>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={sortBy === 'departure_time' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('departure_time')}
          >
            Time
          </Button>
          <Button
            variant={sortBy === 'price' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('price')}
          >
            Price
          </Button>
          <Button
            variant={sortBy === 'rating' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('rating')}
          >
            Rating
          </Button>
        </div>
      </div>

      {/* Clear Filters */}
      <Button
        variant="ghost"
        className="w-full"
        onClick={() => {
          setSliderValue(2000);
          setMaxPrice(2000);
          setDepartureTime([]);
          setWomenOnly(false);
          setPetFriendly(false);
          setInstantApproval(false);
          setSortBy('departure_time');
        }}
        disabled={activeFiltersCount === 0}
      >
        <X className="w-4 h-4 mr-2" />
        Clear All Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30 pt-20">
      <div className="container px-4 py-6">
        {/* Search Widget */}
        <div className="mb-6">
          <SearchWidget variant="compact" />
        </div>

        {/* Search Summary */}
        {(searchParams.from || searchParams.to || searchParams.date) && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {searchParams.from && (
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                <MapPin className="w-3 h-3" />
                From: {searchParams.from}
              </span>
            )}
            {searchParams.to && (
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                <MapPin className="w-3 h-3" />
                To: {searchParams.to}
              </span>
            )}
            {searchParams.date && (
              <span className="inline-flex items-center gap-1 bg-emerald/10 text-emerald-700 px-3 py-1 rounded-full text-sm">
                <CalendarDays className="w-3 h-3" />
                {format(parseISO(searchParams.date), 'EEE, MMM d')}
              </span>
            )}
            {searchParams.passengers > 1 && (
              <span className="inline-flex items-center gap-1 bg-muted px-3 py-1 rounded-full text-sm">
                <Users className="w-3 h-3" />
                {searchParams.passengers} passengers
              </span>
            )}
          </div>
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              {searchParams.from && searchParams.to 
                ? `${searchParams.from.split(',')[0]} → ${searchParams.to.split(',')[0]}`
                : searchParams.from 
                  ? `Rides from ${searchParams.from.split(',')[0]}`
                  : searchParams.to
                    ? `Rides to ${searchParams.to.split(',')[0]}`
                    : 'All Available Rides'
              }
            </h1>
            <p className="text-muted-foreground">
              {loading 
                ? 'Searching for rides...' 
                : filteredRides.length > 0
                  ? `${filteredRides.length} ride${filteredRides.length !== 1 ? 's' : ''} found${totalCount > filteredRides.length ? ` (${totalCount} total)` : ''}`
                  : 'No rides found'
              }
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => fetchRides(1, true)}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>

            {/* View Toggle */}
            <div className="hidden md:flex items-center bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                className="h-8"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4 mr-1" />
                List
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                className="h-8"
                onClick={() => setViewMode('map')}
              >
                <Map className="w-4 h-4 mr-1" />
                Map
              </Button>
            </div>

            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden relative">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile View Toggle */}
        <div className="md:hidden flex items-center justify-center mb-4">
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className="h-8"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4 mr-1" />
              List
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'ghost'}
              size="sm"
              className="h-8"
              onClick={() => setViewMode('map')}
            >
              <Map className="w-4 h-4 mr-1" />
              Map
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Desktop Filters */}
          <div className="hidden md:block">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5" />
                <h2 className="font-semibold">Filters</h2>
              </div>
              <FilterContent />
            </div>
          </div>

          {/* Results */}
          <div className="md:col-span-3">
            {/* Quick Price Slider - Always Visible */}
            <div className="flex items-center gap-3 mb-4 bg-card border border-border rounded-lg px-4 py-3">
              <span className="text-sm font-medium whitespace-nowrap">Max ₹</span>
              <input
                type="range"
                min="100"
                max="2000"
                step="100"
                value={sliderValue}
                onChange={(e) => setSliderValue(Number(e.target.value))}
                className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <span className="text-sm font-bold text-primary min-w-[50px] text-right">
                {sliderValue >= 2000 ? 'Any' : `₹${sliderValue}`}
              </span>
            </div>

            {viewMode === 'map' ? (
              /* Map View */
              <div className="h-[calc(100vh-280px)] min-h-[500px]">
                {loading ? (
                  <div className="h-full bg-gradient-to-br from-indigo-100 to-emerald-50 rounded-xl flex items-center justify-center border border-border">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">Loading rides...</p>
                    </div>
                  </div>
                ) : (
                  <SearchMapView 
                    rides={filteredRides} 
                    className="h-full"
                  />
                )}
              </div>
            ) : (
              /* List View */
              <div className="space-y-4">
                {loading ? (
                  <RideListSkeleton count={3} />
                ) : error ? (
                  <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <ErrorState 
                      type="network"
                      title="Search Failed"
                      message={error}
                      onRetry={() => fetchRides(1, true)}
                    />
                  </div>
                ) : filteredRides.length > 0 ? (
                  <>
                    {filteredRides.map((ride) => (
                      <RideCard key={ride.id} ride={ride} />
                    ))}
                    {hasMore && !loading && (
                      <div className="text-center pt-4">
                        <Button variant="outline" onClick={loadMore}>
                          Load More Rides
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-card border border-border rounded-xl p-8 text-center">
                    <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="font-semibold text-lg mb-2">No rides found</p>
                    <p className="text-muted-foreground mb-6">
                      {rides.length === 0 
                        ? "We couldn't find any rides matching your search criteria."
                        : "No rides match your current filters. Try adjusting them."
                      }
                    </p>
                    
                    {/* Alternative Dates Suggestions */}
                    {alternativeDates.length > 0 && rides.length === 0 && (
                      <div className="mb-6">
                        <p className="text-sm font-medium mb-3">Rides available on other dates:</p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {alternativeDates.slice(0, 5).map(({ date, count }) => (
                            <Button
                              key={date}
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => {
                                setSearchParams({
                                  ...searchParams,
                                  date,
                                });
                              }}
                            >
                              <CalendarDays className="w-3 h-3" />
                              {format(parseISO(date), 'EEE, MMM d')}
                              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full ml-1">
                                {count}
                              </span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      {activeFiltersCount > 0 && (
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSliderValue(2000);
                            setMaxPrice(2000);
                            setDepartureTime([]);
                            setWomenOnly(false);
                            setPetFriendly(false);
                            setInstantApproval(false);
                            setSortBy('departure_time');
                          }}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Clear Filters
                        </Button>
                      )}
                      <Button onClick={() => fetchRides(1, true)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Search Again
                      </Button>
                    </div>
                    
                    {/* Tips */}
                    <Alert className="mt-6 text-left">
                      <AlertDescription className="text-sm">
                        <strong>Tips for finding rides:</strong>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                          <li>Try searching for nearby cities or districts</li>
                          <li>Check different dates (weekends often have more rides)</li>
                          <li>Set up an alert to be notified when new rides are posted</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
