export interface Ride {
  id: string;
  driverName: string;
  driverPhoto: string;
  driverRating: number;
  driverReviews: number;
  isVerified: boolean;
  isAadhaarVerified: boolean;
  isPhoneVerified: boolean;
  carModel: string;
  carColor: string;
  hasAC: boolean;
  from: string;
  fromCity: string;
  to: string;
  toCity: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  seatsAvailable: number;
  totalSeats: number;
  instantApproval: boolean;
  womenOnly: boolean;
  petFriendly: boolean;
  smokingAllowed: boolean;
  maxTwoInBack: boolean;
  chatty: 'quiet' | 'moderate' | 'chatty';
}

export const mockRides: Ride[] = [
  {
    id: '1',
    driverName: 'Rajesh Kumar',
    driverPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    driverRating: 4.8,
    driverReviews: 156,
    isVerified: true,
    isAadhaarVerified: true,
    isPhoneVerified: true,
    carModel: 'Maruti Swift Dzire',
    carColor: 'White',
    hasAC: true,
    from: 'Andheri East, Mumbai',
    fromCity: 'Mumbai',
    to: 'Hinjewadi Phase 1, Pune',
    toCity: 'Pune',
    date: '2024-01-15',
    departureTime: '06:00',
    arrivalTime: '09:30',
    duration: '3h 30m',
    price: 450,
    seatsAvailable: 3,
    totalSeats: 4,
    instantApproval: true,
    womenOnly: false,
    petFriendly: false,
    smokingAllowed: false,
    maxTwoInBack: true,
    chatty: 'moderate',
  },
  {
    id: '2',
    driverName: 'Priya Sharma',
    driverPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    driverRating: 4.9,
    driverReviews: 89,
    isVerified: true,
    isAadhaarVerified: true,
    isPhoneVerified: true,
    carModel: 'Honda City',
    carColor: 'Silver',
    hasAC: true,
    from: 'Bandra West, Mumbai',
    fromCity: 'Mumbai',
    to: 'Koregaon Park, Pune',
    toCity: 'Pune',
    date: '2024-01-15',
    departureTime: '07:30',
    arrivalTime: '11:00',
    duration: '3h 30m',
    price: 500,
    seatsAvailable: 2,
    totalSeats: 3,
    instantApproval: true,
    womenOnly: true,
    petFriendly: false,
    smokingAllowed: false,
    maxTwoInBack: true,
    chatty: 'chatty',
  },
  {
    id: '3',
    driverName: 'Amit Patel',
    driverPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    driverRating: 4.6,
    driverReviews: 234,
    isVerified: true,
    isAadhaarVerified: true,
    isPhoneVerified: true,
    carModel: 'Hyundai Creta',
    carColor: 'Black',
    hasAC: true,
    from: 'Powai, Mumbai',
    fromCity: 'Mumbai',
    to: 'Wakad, Pune',
    toCity: 'Pune',
    date: '2024-01-15',
    departureTime: '08:00',
    arrivalTime: '11:45',
    duration: '3h 45m',
    price: 420,
    seatsAvailable: 4,
    totalSeats: 4,
    instantApproval: false,
    womenOnly: false,
    petFriendly: true,
    smokingAllowed: false,
    maxTwoInBack: false,
    chatty: 'quiet',
  },
  {
    id: '4',
    driverName: 'Sneha Reddy',
    driverPhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    driverRating: 4.7,
    driverReviews: 67,
    isVerified: true,
    isAadhaarVerified: true,
    isPhoneVerified: true,
    carModel: 'Tata Nexon',
    carColor: 'Blue',
    hasAC: true,
    from: 'Thane West, Mumbai',
    fromCity: 'Mumbai',
    to: 'Kothrud, Pune',
    toCity: 'Pune',
    date: '2024-01-15',
    departureTime: '09:00',
    arrivalTime: '12:30',
    duration: '3h 30m',
    price: 480,
    seatsAvailable: 2,
    totalSeats: 4,
    instantApproval: true,
    womenOnly: true,
    petFriendly: false,
    smokingAllowed: false,
    maxTwoInBack: true,
    chatty: 'moderate',
  },
];

export const popularRoutes = [
  { from: 'Mumbai', to: 'Pune', price: 400 },
  { from: 'Delhi', to: 'Jaipur', price: 600 },
  { from: 'Bangalore', to: 'Mysore', price: 350 },
  { from: 'Chennai', to: 'Pondicherry', price: 400 },
  { from: 'Hyderabad', to: 'Vijayawada', price: 500 },
  { from: 'Kolkata', to: 'Durgapur', price: 300 },
];

export const indianCities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur',
  'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad',
  'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad',
  'Amritsar', 'Navi Mumbai', 'Prayagraj', 'Ranchi', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur', 'Madurai',
  'Raipur', 'Kota', 'Guwahati', 'Chandigarh', 'Solapur', 'Hubballi', 'Bareilly', 'Moradabad', 'Mysuru', 'Gurugram',
  'Aligarh', 'Jalandhar', 'Tiruchirappalli', 'Bhubaneswar', 'Salem', 'Warangal', 'Guntur', 'Bikaner', 'Noida', 'Dehradun',
  'Udaipur', 'Puducherry', 'Shimla', 'Haridwar', 'Rishikesh', 'Rourkela', 'Shillong', 'Kochi', 'Thiruvananthapuram', 'Mangalore',
  'Asansol', 'Durgapur', 'Nellore', 'Kolhapur', 'Ajmer', 'Akola', 'Kalaburagi', 'Jamnagar', 'Ujjain', 'Loni',
  'Siliguri', 'Jhansi', 'Ulhasnagar', 'Jammu', 'Sangli', 'Mirzapur', 'Belagavi', 'Muzaffarpur', 'Malegaon', 'Gaya',
  'Jalgaon', 'Kadapa', 'Tirupati', 'Kakinada', 'Karimnagar', 'Nizamabad', 'Ballari', 'Davanagere', 'Bhilai', 'Durg',
  'Rewa', 'Satna', 'Ratlam', 'Korba', 'Bilaspur', 'Haldwani', 'Roorkee', 'Alwar', 'Bhilwara', 'Sikar',
  'Muzaffarnagar', 'Saharanpur', 'Gorakhpur', 'Bokaro', 'Hazaribagh', 'Cuttack', 'Silchar', 'Agartala', 'Imphal', 'Aizawl',
  'Panaji', 'Margao', 'Mapusa', 'Port Blair', 'Patiala', 'Bathinda', 'Moga', 'Hisar', 'Rohtak', 'Panipat',
  'Karnal', 'Kurukshetra', 'Ambala', 'Sirsa', 'Yamunanagar', 'Palakkad', 'Thrissur', 'Kannur', 'Kozhikode', 'Kottayam',
  'Vellore', 'Erode', 'Hosur', 'Tirunelveli', 'Thoothukudi', 'Nagercoil',
];
