// Google Maps types declaration for TypeScript
// This augments the global namespace to include Google Maps types

declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps: () => void;
  }
}

// Re-export common types for convenience
export type GoogleMapsType = typeof google.maps;
export type GoogleMap = google.maps.Map;
export type GoogleMarker = google.maps.Marker;
export type GoogleDirectionsService = google.maps.DirectionsService;
export type GoogleDirectionsRenderer = google.maps.DirectionsRenderer;
export type GoogleAutocompleteService = google.maps.places.AutocompleteService;
export type GooglePlacesService = google.maps.places.PlacesService;
export type GoogleLatLng = google.maps.LatLng;
export type GoogleLatLngLiteral = google.maps.LatLngLiteral;

export {};
