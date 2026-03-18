// Business Constants for Trapy - Revenue Model
// 
// Formula:
// X = Distance in KM
// Y (max allowed per passenger) = X × 3
// Z = Number of passengers
// T (total ride value) = Y × (Z + 1)
// E (efficient split per passenger) = 0.6 × T / Z
//
// Price Range: 0 → (E ± 15) → Y
// Platform Fee: 10% of passenger payment
// Driver Gets: 90% of passenger payment × Z passengers

// Maximum price per km (₹3/km cap)
export const MAX_PRICE_PER_KM = 3;

// Platform fee percentage (10% commission)
export const PLATFORM_FEE_PERCENTAGE = 10;

// Free tier booking fee (displayed as flat fee for marketing)
export const FREE_TIER_BOOKING_FEE = 10; // ₹10 or 10% whichever is applicable

// Price flexibility range (±₹15 from suggested)
export const PRICE_FLEXIBILITY = 15;

// Premium subscription price
export const PREMIUM_SUBSCRIPTION_PRICE = 99;

// Efficiency factor for cost splitting
export const EFFICIENCY_FACTOR = 0.6;

// Calculate max allowed price per passenger based on distance (Y = X × 3)
export const calculateMaxAllowedPrice = (distanceKm: number): number => {
  return Math.round(distanceKm * MAX_PRICE_PER_KM);
};

// Calculate total ride value T = Y × (Z + 1)
export const calculateTotalRideValue = (distanceKm: number, passengers: number): number => {
  const maxPrice = calculateMaxAllowedPrice(distanceKm);
  return maxPrice * (passengers + 1);
};

// Calculate efficient split per passenger E = 0.6 × T / Z
export const calculateEfficientSplit = (distanceKm: number, passengers: number): number => {
  if (passengers <= 0) return 0;
  const totalValue = calculateTotalRideValue(distanceKm, passengers);
  return Math.round(EFFICIENCY_FACTOR * totalValue / passengers);
};

// Calculate price range for a ride
export const calculatePriceRange = (distanceKm: number, passengers: number): { 
  min: number; 
  suggested: number; 
  max: number;
  suggestedMin: number;
  suggestedMax: number;
} => {
  const efficientSplit = calculateEfficientSplit(distanceKm, passengers);
  const maxAllowed = calculateMaxAllowedPrice(distanceKm);
  
  return {
    min: 0,
    suggested: efficientSplit,
    max: maxAllowed,
    suggestedMin: Math.max(0, efficientSplit - PRICE_FLEXIBILITY),
    suggestedMax: Math.min(maxAllowed, efficientSplit + PRICE_FLEXIBILITY),
  };
};

// Calculate platform fee (10% of passenger payment)
export const calculatePlatformFee = (passengerPrice: number): number => {
  return Math.round(passengerPrice * (PLATFORM_FEE_PERCENTAGE / 100));
};

// Calculate driver earnings per passenger (90% of payment)
export const calculateDriverEarningsPerPassenger = (passengerPrice: number): number => {
  return passengerPrice - calculatePlatformFee(passengerPrice);
};

// Calculate total driver earnings from all passengers
export const calculateDriverEarnings = (passengerPrice: number, passengers: number): number => {
  return calculateDriverEarningsPerPassenger(passengerPrice) * passengers;
};

// Calculate total price for passenger checkout (includes taxes)
export const calculatePassengerCheckout = (pricePerSeat: number, seats: number): { 
  subtotal: number;
  platformFee: number; 
  totalPrice: number;
  driverReceives: number;
} => {
  const subtotal = pricePerSeat * seats;
  const platformFee = calculatePlatformFee(subtotal);
  const driverReceives = subtotal - platformFee;
  
  return {
    subtotal,
    platformFee,
    totalPrice: subtotal, // Passenger pays E (taxes included)
    driverReceives,
  };
};

// Calculate money saved by pooler/driver compared to actual fuel cost
export const calculateDriverSavings = (driverEarnings: number, actualFuelCost: number): {
  savings: number;
  savingsPercentage: number;
} => {
  const savings = actualFuelCost - (actualFuelCost - driverEarnings);
  const savingsPercentage = actualFuelCost > 0 ? Math.round((driverEarnings / actualFuelCost) * 100) : 0;
  
  return {
    savings: driverEarnings,
    savingsPercentage,
  };
};

// Estimate actual fuel cost (₹14.4/km average for petrol cars in India)
export const ESTIMATED_FUEL_COST_PER_KM = 14.4;

export const estimateActualFuelCost = (distanceKm: number): number => {
  return Math.round(distanceKm * ESTIMATED_FUEL_COST_PER_KM);
};

// Legacy function for backward compatibility
export const calculateTotalPrice = (pricePerSeat: number, seats: number): { totalPrice: number; platformFee: number } => {
  const checkout = calculatePassengerCheckout(pricePerSeat, seats);
  return {
    totalPrice: checkout.totalPrice,
    platformFee: checkout.platformFee,
  };
};

// Validate price is within allowed range
export const validatePrice = (price: number, distanceKm: number): boolean => {
  return price >= 0 && price <= calculateMaxAllowedPrice(distanceKm);
};

// Suggest price based on distance and default 4 passengers
export const suggestPrice = (distanceKm: number, passengers: number = 4): number => {
  return calculateEfficientSplit(distanceKm, passengers);
};

