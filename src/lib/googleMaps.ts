// Google Maps utility functions and types

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteInfo {
  distance: number; // in km
  duration: number; // in minutes
  polyline: string;
}

export interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  location: LatLng;
}

// Cache for loaded Google Maps API
let googleMapsPromise: Promise<any> | null = null;
let isLoading = false;

// Safe window reference for SSR/test environments
const win = typeof window !== 'undefined' ? (window as any) : ({} as any);

export const loadGoogleMapsAPI = async (apiKey: string): Promise<any> => {
  // Return cached promise if already loading or loaded
  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  // Check if already loaded
  if (win.google?.maps) {
    return Promise.resolve(win.google.maps);
  }

  if (isLoading) {
    // Wait for the existing load to complete
    return new Promise((resolve, reject) => {
      const checkLoaded = setInterval(() => {
        if (win.google?.maps) {
          clearInterval(checkLoaded);
          resolve(win.google.maps);
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkLoaded);
        reject(new Error('Google Maps API load timeout'));
      }, 10000);
    });
  }

  isLoading = true;
  
  googleMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;

    // Global callback
    win.initGoogleMaps = () => {
      isLoading = false;
      resolve(win.google.maps);
    };

    script.onerror = () => {
      isLoading = false;
      googleMapsPromise = null;
      reject(new Error('Failed to load Google Maps API'));
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
};

// Get coordinates from place name using Geocoding
export const geocodeAddress = async (address: string): Promise<LatLng | null> => {
  if (!win.google?.maps) return null;
  
  const geocoder = new win.google.maps.Geocoder();
  
  return new Promise((resolve) => {
    geocoder.geocode({ address: `${address}, India` }, (results: any, status: string) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        resolve({
          lat: location.lat(),
          lng: location.lng(),
        });
      } else {
        resolve(null);
      }
    });
  });
};

// Calculate route between two points
export const calculateRoute = async (
  origin: LatLng | string,
  destination: LatLng | string
): Promise<RouteInfo | null> => {
  if (!win.google?.maps) return null;
  
  const directionsService = new win.google.maps.DirectionsService();
  
  return new Promise((resolve) => {
    directionsService.route(
      {
        origin,
        destination,
        travelMode: win.google.maps.TravelMode.DRIVING,
      },
      (result: any, status: string) => {
        if (status === 'OK' && result && result.routes[0]) {
          const route = result.routes[0];
          const leg = route.legs[0];
          
          resolve({
            distance: Math.round((leg.distance?.value || 0) / 1000), // Convert to km
            duration: Math.round((leg.duration?.value || 0) / 60), // Convert to minutes
            polyline: route.overview_polyline,
          });
        } else {
          resolve(null);
        }
      }
    );
  });
};

// Get distance between two coordinates (Haversine formula for fallback)
export const getHaversineDistance = (from: LatLng, to: LatLng): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(to.lat - from.lat);
  const dLon = deg2rad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(from.lat)) *
      Math.cos(deg2rad(to.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

// Get user's current location
export const getCurrentLocation = (): Promise<LatLng | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      }
    );
  });
};

// Watch user's location for real-time tracking
export const watchLocation = (
  onLocationUpdate: (location: LatLng) => void,
  onError?: (error: GeolocationPositionError) => void
): number | null => {
  if (!navigator.geolocation) return null;
  
  return navigator.geolocation.watchPosition(
    (position) => {
      onLocationUpdate({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    },
    onError,
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
};

// Stop watching location
export const stopWatchingLocation = (watchId: number): void => {
  navigator.geolocation.clearWatch(watchId);
};

// Format duration string
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

// Indian cities coordinates for quick lookup (fallback)
export const INDIAN_CITY_COORDS: Record<string, LatLng> = {
  'Delhi': { lat: 28.6139, lng: 77.2090 },
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'Bangalore': { lat: 12.9716, lng: 77.5946 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Kolkata': { lat: 22.5726, lng: 88.3639 },
  'Hyderabad': { lat: 17.3850, lng: 78.4867 },
  'Pune': { lat: 18.5204, lng: 73.8567 },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'Jaipur': { lat: 26.9124, lng: 75.7873 },
  'Lucknow': { lat: 26.8467, lng: 80.9462 },
  'Chandigarh': { lat: 30.7333, lng: 76.7794 },
  'Goa': { lat: 15.2993, lng: 74.1240 },
  'Surat': { lat: 21.1702, lng: 72.8311 },
  'Indore': { lat: 22.7196, lng: 75.8577 },
  'Bhopal': { lat: 23.2599, lng: 77.4126 },
  'Nagpur': { lat: 21.1458, lng: 79.0882 },
  'Varanasi': { lat: 25.3176, lng: 82.9739 },
  'Agra': { lat: 27.1767, lng: 78.0081 },
  'Amritsar': { lat: 31.6340, lng: 74.8723 },
  'Kochi': { lat: 9.9312, lng: 76.2673 },
  'Vizag': { lat: 17.6868, lng: 83.2185 },
  'Coimbatore': { lat: 11.0168, lng: 76.9558 },
  'Mysore': { lat: 12.2958, lng: 76.6394 },
  'Vadodara': { lat: 22.3072, lng: 73.1812 },
  'Nashik': { lat: 20.0059, lng: 73.7897 },
  'Patna': { lat: 25.5941, lng: 85.1376 },
  'Ranchi': { lat: 23.3441, lng: 85.3096 },
  'Bhubaneswar': { lat: 20.2961, lng: 85.8245 },
  'Guwahati': { lat: 26.1445, lng: 91.7362 },
  'Dehradun': { lat: 30.3165, lng: 78.0322 },
  'Shimla': { lat: 31.1048, lng: 77.1734 },
  'Manali': { lat: 32.2396, lng: 77.1887 },
  'Udaipur': { lat: 24.5854, lng: 73.7125 },
  'Jodhpur': { lat: 26.2389, lng: 73.0243 },
  'Rishikesh': { lat: 30.0869, lng: 78.2676 },
  'Haridwar': { lat: 29.9457, lng: 78.1642 },
};

// Get coordinates for a city (with fallback)
export const getCityCoordinates = async (cityName: string): Promise<LatLng | null> => {
  // Try exact match first
  const normalizedCity = cityName.trim();
  for (const [city, coords] of Object.entries(INDIAN_CITY_COORDS)) {
    if (normalizedCity.toLowerCase().includes(city.toLowerCase())) {
      return coords;
    }
  }
  
  // Fall back to geocoding
  return geocodeAddress(cityName);
};
