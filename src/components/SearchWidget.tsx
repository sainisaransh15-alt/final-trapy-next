'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users, Search, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useApp } from '@/contexts/AppContext';
import PlaceAutocomplete from '@/components/PlaceAutocomplete';
import { format } from 'date-fns';

interface SearchWidgetProps {
  variant?: 'hero' | 'compact';
}

export default function SearchWidget({ variant = 'hero' }: SearchWidgetProps) {
  const router = useRouter();
  const { searchParams, setSearchParams } = useApp();
  const [from, setFrom] = useState(searchParams.from);
  const [to, setTo] = useState(searchParams.to);
  const [date, setDate] = useState<Date | undefined>(
    searchParams.date ? new Date(searchParams.date) : undefined
  );
  const [passengers, setPassengers] = useState(searchParams.passengers);

  const handleSearch = () => {
    setSearchParams({
      from,
      to,
      date: date ? format(date, 'yyyy-MM-dd') : '',
      passengers,
    });
    router.push('/search');
  };

  const swapLocations = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const isHero = variant === 'hero';

  return (
    <div
      className={`${
        isHero
          ? 'bg-card shadow-soft rounded-2xl p-6 md:p-8 border border-border'
          : 'bg-card rounded-xl p-4 border border-border'
      }`}
    >
      <div className={`grid gap-4 ${isHero ? 'md:grid-cols-5' : 'md:grid-cols-4'}`}>
        {/* From */}
        <div className={isHero ? 'md:col-span-1' : ''}>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Leaving from
          </label>
          <PlaceAutocomplete
            value={from}
            onChange={(val, coords) => {
              setFrom(val);
              // We can later store coords if needed in searchParams
            }}
            placeholder="Enter city"
            icon="origin"
            className="h-12"
          />
        </div>

        {/* Swap Button (Hero only) */}
        {isHero && (
          <div className="hidden md:flex items-end justify-center pb-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={swapLocations}
              className="rounded-full"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* To */}
        <div className={isHero ? 'md:col-span-1' : ''}>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Going to
          </label>
          <PlaceAutocomplete
            value={to}
            onChange={(val, coords) => {
              setTo(val);
              // Store coords if needed later
            }}
            placeholder="Enter city"
            icon="destination"
            className="h-12"
          />
        </div>

        {/* Date */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-12 justify-start text-left font-normal"
              >
                <Calendar className="w-5 h-5 mr-2 text-muted-foreground" />
                {date ? format(date, 'MMM d, yyyy') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Passengers */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Passengers
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-12 justify-start text-left font-normal"
              >
                <Users className="w-5 h-5 mr-2 text-muted-foreground" />
                {passengers} {passengers === 1 ? 'passenger' : 'passengers'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48" align="start">
              <div className="flex items-center justify-between">
                <span className="text-sm">Passengers</span>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPassengers(Math.max(1, passengers - 1))}
                  >
                    -
                  </Button>
                  <span className="w-6 text-center font-medium">{passengers}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPassengers(Math.min(4, passengers + 1))}
                  >
                    +
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Search Button (Hero only) */}
        {isHero && (
          <div className="md:col-span-5 md:flex md:justify-center mt-2">
            <Button size="xl" className="w-full md:w-auto md:px-12" onClick={handleSearch}>
              <Search className="w-5 h-5 mr-2" />
              Search Rides
            </Button>
          </div>
        )}
      </div>

      {!isHero && (
        <Button className="w-full mt-4" onClick={handleSearch}>
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      )}
    </div>
  );
}
