export type Language = 'en' | 'hi';

export const translations = {
  en: {
    // Navigation
    'nav.findRide': 'Find a Ride',
    'nav.publishRide': 'Publish a Ride',
    'nav.login': 'Login',
    'nav.dashboard': 'Dashboard',
    'nav.logout': 'Logout',
    
    // Common
    'common.search': 'Search',
    'common.book': 'Book Now',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.loading': 'Loading...',
    'common.seats': 'seats',
    'common.seat': 'seat',
    'common.perSeat': 'per seat',
    'common.available': 'available',
    'common.verified': 'Verified',
    'common.share': 'Share',
    'common.report': 'Report',
    'common.getStarted': 'Get Started',
    'common.totalRides': 'Total Rides',
    'common.walletBalance': 'Wallet Balance',
    'common.rating': 'Rating',
    
    // Home Page - Hero
    'home.heroTitle1': 'Ride Together,',
    'home.heroTitle2': 'Save Together',
    'home.heroSubtitle': "India's trusted carpooling platform. Share rides, split costs, and travel comfortably.",
    'home.welcomeBack': 'Welcome back,',
    'home.whatToDo': 'What would you like to do today?',
    
    // Home Page - Trust Badges
    'home.verifiedIds': 'Verified IDs',
    'home.dlVerified': 'DL Verified Drivers',
    'home.securePayments': 'Secure Payments',
    'home.upiCards': 'UPI & Cards Accepted',
    'home.womenOnly': 'Women-Only Option',
    'home.safeRides': 'Safe rides for women',
    
    // Home Page - About Section
    'home.aboutTitle': 'About',
    'home.aboutDescription': "Trapy is India's most trusted carpooling platform, connecting drivers with empty seats to passengers heading the same way. We're building a community of 10 lakh+ travelers who believe in smart, safe, and sustainable travel.",
    'home.safetyFirst': 'Safety First',
    'home.safetyDesc': 'All drivers are verified with DL checks. Real-time ride tracking and emergency SOS.',
    'home.saveMoney': 'Save Money',
    'home.saveMoneyDesc': 'Split travel costs and save up to 75% compared to trains, buses, or cabs. FREE during launch!',
    'home.community': 'Community',
    'home.communityDesc': 'Join 10 lakh+ travelers building a sustainable future through shared mobility.',
    'home.womenSafety': 'Women Safety',
    'home.womenSafetyDesc': 'Dedicated women-only rides with verified female drivers for safe travel.',
    'home.trustedReviews': 'Trusted Reviews',
    'home.trustedReviewsDesc': 'Transparent ratings and reviews help you choose the perfect ride.',
    'home.instantBooking': 'Instant Booking',
    'home.instantBookingDesc': 'Book your ride in seconds with instant confirmation and easy payment.',
    
    // Home Page - How It Works
    'home.howItWorks': 'How Trapy Works',
    'home.easySteps': 'Travel made simple in 3 easy steps',
    'home.stepSearch': 'Search',
    'home.stepSearchDesc': 'Enter your route and find available rides',
    'home.stepBook': 'Book',
    'home.stepBookDesc': 'Choose your ride and book a seat instantly',
    'home.stepSave': 'Save',
    'home.stepSaveDesc': 'Pay less and travel comfortably',
    
    // Home Page - Popular Routes
    'home.popularRoutes': 'Popular Routes',
    'home.mostTraveled': 'Most traveled routes on Trapy',
    'home.quickAccess': 'Quick access to trending destinations',
    
    // Home Page - Why Choose
    'home.whyChoose': 'Why Choose',
    'home.save75': 'Save up to 75% compared to trains & buses',
    'home.verifiedDrivers': 'Verified drivers with DL check',
    'home.womenOnlyOption': 'Women-only ride options for safety',
    'home.flexiblePickup': 'Flexible pickup points',
    'home.instantConfirm': 'Instant booking confirmation',
    'home.freeLaunch': '🎉 FREE service during launch!',
    
    // Home Page - CTA
    'home.readyToSave': 'Ready to Save on Your Next Trip?',
    'home.joinNow': 'Join thousands of travelers who are already saving money and making new friends on Trapy.',
    'home.startJourney': 'Start Your Journey',
    
    // Action Cards
    'home.findARide': 'Find a Ride',
    'home.findRideDesc': 'Search for available rides and book your seat instantly',
    'home.searchRides': 'Search Rides',
    'home.publishARide': 'Publish a Ride',
    'home.publishRideDesc': 'Offer your ride and earn money by sharing your journey',
    'home.publishRide': 'Publish Ride',
    
    // Search
    'search.from': 'From',
    'search.to': 'To',
    'search.date': 'Date',
    'search.passengers': 'Passengers',
    'search.searchRides': 'Search Rides',
    'search.noRides': 'No rides found',
    
    // Ride Details
    'ride.tripDetails': 'Trip Details',
    'ride.vehicle': 'Vehicle',
    'ride.pickupPoints': 'Pickup Points',
    'ride.preferences': 'Ride Preferences',
    'ride.aboutDriver': 'About Driver',
    'ride.priceBreakdown': 'Price Breakdown',
    'ride.subtotal': 'Subtotal',
    'ride.platformFee': 'Platform fee',
    'ride.discount': 'Discount',
    'ride.total': 'Total',
    'ride.bookSeats': 'Book Seats',
    'ride.womenOnly': 'Women Only',
    'ride.smokingOk': 'Smoking OK',
    'ride.noSmoking': 'No smoking',
    'ride.petsOk': 'Pets OK',
    'ride.noPets': 'No pets',
    'ride.musicOk': 'Music OK',
    'ride.noMusic': 'No music',
    'ride.chatty': 'Loves to chat',
    'ride.quiet': 'Prefers quiet',
    'ride.shareRide': 'Share this ride',
    'ride.shareWhatsApp': 'Share on WhatsApp',
    'ride.copyLink': 'Copy Link',
    'ride.linkCopied': 'Link copied!',
    
    // Auth
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.fullName': 'Full Name',
    'auth.phone': 'Phone Number',
    
    // Dashboard
    'dashboard.myRides': 'My Rides',
    'dashboard.myBookings': 'My Bookings',
    'dashboard.earnings': 'Earnings',
    'dashboard.profile': 'Profile',
    
    // Safety
    'safety.title': 'Safety Features',
    'safety.sos': 'SOS Emergency',
    'safety.trustedContacts': 'Trusted Contacts',
    'safety.shareTrip': 'Share Trip',
    
    // Footer
    'footer.tagline': 'Ride Together, Save Together',
    'footer.about': 'About',
    'footer.help': 'Help',
    'footer.terms': 'Terms',
    'footer.privacy': 'Privacy',
  },
  hi: {
    // Navigation
    'nav.findRide': 'राइड खोजें',
    'nav.publishRide': 'राइड पब्लिश करें',
    'nav.login': 'लॉग इन',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.logout': 'लॉग आउट',
    
    // Common
    'common.search': 'खोजें',
    'common.book': 'अभी बुक करें',
    'common.cancel': 'रद्द करें',
    'common.save': 'सहेजें',
    'common.loading': 'लोड हो रहा है...',
    'common.seats': 'सीटें',
    'common.seat': 'सीट',
    'common.perSeat': 'प्रति सीट',
    'common.available': 'उपलब्ध',
    'common.verified': 'सत्यापित',
    'common.share': 'शेयर करें',
    'common.report': 'रिपोर्ट करें',
    'common.getStarted': 'शुरू करें',
    'common.totalRides': 'कुल राइड्स',
    'common.walletBalance': 'वॉलेट बैलेंस',
    'common.rating': 'रेटिंग',
    
    // Home Page - Hero
    'home.heroTitle1': 'साथ चलें,',
    'home.heroTitle2': 'बचत करें',
    'home.heroSubtitle': 'भारत का भरोसेमंद कारपूलिंग प्लेटफॉर्म। राइड शेयर करें, खर्च बांटें, आराम से सफर करें।',
    'home.welcomeBack': 'वापसी पर स्वागत है,',
    'home.whatToDo': 'आज आप क्या करना चाहेंगे?',
    
    // Home Page - Trust Badges
    'home.verifiedIds': 'सत्यापित आईडी',
    'home.dlVerified': 'DL सत्यापित ड्राइवर',
    'home.securePayments': 'सुरक्षित भुगतान',
    'home.upiCards': 'UPI और कार्ड स्वीकार्य',
    'home.womenOnly': 'केवल महिलाएं',
    'home.safeRides': 'महिलाओं के लिए सुरक्षित राइड',
    
    // Home Page - About Section
    'home.aboutTitle': 'के बारे में',
    'home.aboutDescription': 'Trapy भारत का सबसे भरोसेमंद कारपूलिंग प्लेटफॉर्म है, जो खाली सीटों वाले ड्राइवरों को उसी दिशा में जाने वाले यात्रियों से जोड़ता है। हम 10 लाख+ यात्रियों का समुदाय बना रहे हैं जो स्मार्ट, सुरक्षित और टिकाऊ यात्रा में विश्वास करते हैं।',
    'home.safetyFirst': 'सुरक्षा पहले',
    'home.safetyDesc': 'सभी ड्राइवर DL जांच के साथ सत्यापित हैं। रियल-टाइम राइड ट्रैकिंग और आपातकालीन SOS।',
    'home.saveMoney': 'पैसे बचाएं',
    'home.saveMoneyDesc': 'यात्रा खर्च बांटें और ट्रेनों, बसों या कैब की तुलना में 75% तक बचाएं। लॉन्च के दौरान मुफ्त!',
    'home.community': 'समुदाय',
    'home.communityDesc': '10 लाख+ यात्रियों से जुड़ें जो साझा गतिशीलता के माध्यम से एक टिकाऊ भविष्य का निर्माण कर रहे हैं।',
    'home.womenSafety': 'महिला सुरक्षा',
    'home.womenSafetyDesc': 'सुरक्षित यात्रा के लिए सत्यापित महिला ड्राइवरों के साथ समर्पित महिला-केवल राइड।',
    'home.trustedReviews': 'विश्वसनीय समीक्षाएं',
    'home.trustedReviewsDesc': 'पारदर्शी रेटिंग और समीक्षाएं आपको सही राइड चुनने में मदद करती हैं।',
    'home.instantBooking': 'तुरंत बुकिंग',
    'home.instantBookingDesc': 'तुरंत पुष्टि और आसान भुगतान के साथ सेकंडों में अपनी राइड बुक करें।',
    
    // Home Page - How It Works
    'home.howItWorks': 'Trapy कैसे काम करता है',
    'home.easySteps': '3 आसान चरणों में यात्रा को सरल बनाया',
    'home.stepSearch': 'खोजें',
    'home.stepSearchDesc': 'अपना मार्ग दर्ज करें और उपलब्ध राइड खोजें',
    'home.stepBook': 'बुक करें',
    'home.stepBookDesc': 'अपनी राइड चुनें और तुरंत सीट बुक करें',
    'home.stepSave': 'बचाएं',
    'home.stepSaveDesc': 'कम भुगतान करें और आराम से यात्रा करें',
    
    // Home Page - Popular Routes
    'home.popularRoutes': 'लोकप्रिय मार्ग',
    'home.mostTraveled': 'Trapy पर सबसे ज्यादा यात्रा किए गए मार्ग',
    'home.quickAccess': 'ट्रेंडिंग गंतव्यों तक त्वरित पहुंच',
    
    // Home Page - Why Choose
    'home.whyChoose': 'क्यों चुनें',
    'home.save75': 'ट्रेनों और बसों की तुलना में 75% तक बचाएं',
    'home.verifiedDrivers': 'DL जांच के साथ सत्यापित ड्राइवर',
    'home.womenOnlyOption': 'सुरक्षा के लिए केवल-महिला राइड विकल्प',
    'home.flexiblePickup': 'लचीले पिकअप पॉइंट',
    'home.instantConfirm': 'तुरंत बुकिंग पुष्टि',
    'home.freeLaunch': '🎉 लॉन्च के दौरान मुफ्त सेवा!',
    
    // Home Page - CTA
    'home.readyToSave': 'अपनी अगली यात्रा पर बचत के लिए तैयार?',
    'home.joinNow': 'हजारों यात्रियों से जुड़ें जो पहले से Trapy पर पैसे बचा रहे हैं और नए दोस्त बना रहे हैं।',
    'home.startJourney': 'अपनी यात्रा शुरू करें',
    
    // Action Cards
    'home.findARide': 'राइड खोजें',
    'home.findRideDesc': 'उपलब्ध राइड खोजें और तुरंत अपनी सीट बुक करें',
    'home.searchRides': 'राइड खोजें',
    'home.publishARide': 'राइड पब्लिश करें',
    'home.publishRideDesc': 'अपनी राइड पेश करें और अपनी यात्रा साझा करके पैसे कमाएं',
    'home.publishRide': 'राइड पब्लिश करें',
    
    // Search
    'search.from': 'कहाँ से',
    'search.to': 'कहाँ तक',
    'search.date': 'तारीख',
    'search.passengers': 'यात्री',
    'search.searchRides': 'राइड खोजें',
    'search.noRides': 'कोई राइड नहीं मिली',
    
    // Ride Details
    'ride.tripDetails': 'यात्रा विवरण',
    'ride.vehicle': 'वाहन',
    'ride.pickupPoints': 'पिकअप पॉइंट्स',
    'ride.preferences': 'राइड प्राथमिकताएं',
    'ride.aboutDriver': 'ड्राइवर के बारे में',
    'ride.priceBreakdown': 'मूल्य विवरण',
    'ride.subtotal': 'उप-योग',
    'ride.platformFee': 'प्लेटफॉर्म शुल्क',
    'ride.discount': 'छूट',
    'ride.total': 'कुल',
    'ride.bookSeats': 'सीटें बुक करें',
    'ride.womenOnly': 'केवल महिलाएं',
    'ride.smokingOk': 'धूम्रपान ठीक',
    'ride.noSmoking': 'धूम्रपान नहीं',
    'ride.petsOk': 'पालतू जानवर ठीक',
    'ride.noPets': 'पालतू नहीं',
    'ride.musicOk': 'संगीत ठीक',
    'ride.noMusic': 'संगीत नहीं',
    'ride.chatty': 'बातचीत पसंद',
    'ride.quiet': 'शांत पसंद',
    'ride.shareRide': 'यह राइड शेयर करें',
    'ride.shareWhatsApp': 'WhatsApp पर शेयर करें',
    'ride.copyLink': 'लिंक कॉपी करें',
    'ride.linkCopied': 'लिंक कॉपी हो गया!',
    
    // Auth
    'auth.signIn': 'साइन इन',
    'auth.signUp': 'साइन अप',
    'auth.email': 'ईमेल',
    'auth.password': 'पासवर्ड',
    'auth.fullName': 'पूरा नाम',
    'auth.phone': 'फोन नंबर',
    
    // Dashboard
    'dashboard.myRides': 'मेरी राइड्स',
    'dashboard.myBookings': 'मेरी बुकिंग्स',
    'dashboard.earnings': 'कमाई',
    'dashboard.profile': 'प्रोफाइल',
    
    // Safety
    'safety.title': 'सुरक्षा सुविधाएं',
    'safety.sos': 'SOS आपातकालीन',
    'safety.trustedContacts': 'विश्वसनीय संपर्क',
    'safety.shareTrip': 'यात्रा शेयर करें',
    
    // Footer
    'footer.tagline': 'साथ चलें, बचत करें',
    'footer.about': 'हमारे बारे में',
    'footer.help': 'सहायता',
    'footer.terms': 'शर्तें',
    'footer.privacy': 'गोपनीयता',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
