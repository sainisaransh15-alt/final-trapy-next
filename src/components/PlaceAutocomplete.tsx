'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { loadGoogleMapsAPI, LatLng } from '@/lib/googleMaps';
import { indianCities } from '@/lib/mockData';


const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

interface PlaceAutocompleteProps {
  value: string;
  onChange: (value: string, coords?: LatLng) => void;
  placeholder?: string;
  icon?: 'origin' | 'destination';
  className?: string;
  disabled?: boolean;
}

interface Prediction {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text: string;
    secondary_text?: string;
  };
}

export default function PlaceAutocomplete({
  value,
  onChange,
  placeholder = 'Enter location',
  icon = 'origin',
  className = '',
  disabled = false,
}: PlaceAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [fallbackCities, setFallbackCities] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const autocompleteService = useRef<any>(null);
  const placesService = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Load Google Maps API
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) return;

    loadGoogleMapsAPI(GOOGLE_MAPS_API_KEY)
      .then(() => {
        const win = window as any;
        autocompleteService.current = new win.google.maps.places.AutocompleteService();
        // Create a dummy div for PlacesService
        const div = document.createElement('div');
        placesService.current = new win.google.maps.places.PlacesService(div);
        setIsApiLoaded(true);
      })
      .catch(() => {
        // Fall back to static city list
        setIsApiLoaded(false);
      });
  }, []);

  // Update input when value prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch predictions from Google
  const fetchPredictions = useCallback(async (query: string) => {
    if (!autocompleteService.current || query.length < 2) {
      setPredictions([]);
      return;
    }

    setIsLoading(true);

    try {
      autocompleteService.current.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: 'in' },
          types: ['(cities)'],
        },
        (results: any, status: string) => {
          setIsLoading(false);
          if (status === 'OK' && results) {
            setPredictions(results);
          } else {
            setPredictions([]);
          }
        }
      );
    } catch {
      setIsLoading(false);
      setPredictions([]);
    }
  }, []);

  // Fetch fallback cities
  const fetchFallbackCities = useCallback((query: string) => {
    if (query.length < 2) {
      setFallbackCities([]);
      return;
    }

    const filtered = indianCities.filter((city) =>
      city.toLowerCase().includes(query.toLowerCase())
    );
    setFallbackCities(filtered.slice(0, 20));
  }, []);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);

    if (isApiLoaded) {
      fetchPredictions(newValue);
    } else {
      fetchFallbackCities(newValue);
    }
  };

  // Get place coordinates
  const getPlaceCoords = useCallback((placeId: string): Promise<LatLng | undefined> => {
    return new Promise((resolve) => {
      if (!placesService.current) {
        resolve(undefined);
        return;
      }

      placesService.current.getDetails(
        { placeId, fields: ['geometry'] },
        (place: any, status: string) => {
          if (status === 'OK' && place?.geometry?.location) {
            resolve({
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            });
          } else {
            resolve(undefined);
          }
        }
      );
    });
  }, []);

  // Handle prediction selection
  const handleSelect = async (prediction: Prediction) => {
    const displayValue = prediction.structured_formatting?.main_text || prediction.description;
    setInputValue(displayValue);
    setIsOpen(false);
    setPredictions([]);

    const coords = await getPlaceCoords(prediction.place_id);
    onChange(displayValue, coords);
  };

  // Handle fallback city selection
  const handleFallbackSelect = (city: string) => {
    setInputValue(city);
    setIsOpen(false);
    setFallbackCities([]);
    onChange(city);
  };

  // Clear input
  const handleClear = () => {
    setInputValue('');
    setPredictions([]);
    setFallbackCities([]);
    onChange('');
    inputRef.current?.focus();
  };

  const showDropdown = isOpen && (predictions.length > 0 || fallbackCities.length > 0);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <MapPin
          className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
            icon === 'origin' ? 'text-green-500' : 'text-red-500'
          }`}
        />
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-10 pr-10 h-12"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
          {isApiLoaded
            ? predictions.map((prediction) => (
                <button
                  key={prediction.place_id}
                  type="button"
                  onClick={() => handleSelect(prediction)}
                  className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3"
                >
                  <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="overflow-hidden">
                    <p className="font-medium truncate">
                      {prediction.structured_formatting?.main_text || prediction.description}
                    </p>
                    {prediction.structured_formatting?.secondary_text && (
                      <p className="text-xs text-muted-foreground truncate">
                        {prediction.structured_formatting.secondary_text}
                      </p>
                    )}
                  </div>
                </button>
              ))
            : fallbackCities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleFallbackSelect(city)}
                  className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3"
                >
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{city}</span>
                </button>
              ))}
        </div>
      )}
    </div>
  );
}
