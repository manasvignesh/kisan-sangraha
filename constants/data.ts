export interface StorageFacility {
  id: string;
  name: string;
  location: string;
  distance: number;
  type: ("Cold" | "Frozen" | "Dairy")[];
  pricePerKgPerDay: number;
  totalCapacity: number;
  availableCapacity: number;
  rating: number;
  reviewCount: number;
  verified: boolean;
  certifications: string[];
  contactPhone: string;
  operatingHours: string;
  minBookingDays: number;
  amenities: string[];
}

export interface Booking {
  id: string;
  facilityId: string;
  facilityName: string;
  facilityLocation: string;
  quantity: number;
  duration: number;
  startDate: string;
  endDate: string;
  totalCost: number;
  pricePerKgPerDay: number;
  status: "active" | "completed" | "cancelled";
  storageType: string;
}

export interface Insight {
  id: string;
  type: "weather" | "market" | "demand";
  title: string;
  message: string;
  severity: "info" | "warning" | "danger";
  icon: string;
  timestamp: string;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  suggestion: string;
  icon: string;
}

export const MOCK_FACILITIES: StorageFacility[] = [
  {
    id: "1",
    name: "Sahyadri Cold Storage",
    location: "Nashik, Maharashtra",
    distance: 3.2,
    type: ["Cold", "Frozen"],
    pricePerKgPerDay: 0.85,
    totalCapacity: 50000,
    availableCapacity: 32000,
    rating: 4.6,
    reviewCount: 128,
    verified: true,
    certifications: ["FSSAI Certified", "ISO 22000", "Govt Verified"],
    contactPhone: "+91 98765 43210",
    operatingHours: "6:00 AM - 10:00 PM",
    minBookingDays: 1,
    amenities: ["24/7 CCTV", "Loading Dock", "Weighbridge", "Insurance"],
  },
  {
    id: "2",
    name: "KrishiSheetala Hub",
    location: "Pune, Maharashtra",
    distance: 5.8,
    type: ["Cold", "Dairy"],
    pricePerKgPerDay: 0.72,
    totalCapacity: 35000,
    availableCapacity: 12000,
    rating: 4.3,
    reviewCount: 89,
    verified: true,
    certifications: ["FSSAI Certified", "Govt Verified"],
    contactPhone: "+91 98765 12345",
    operatingHours: "5:00 AM - 11:00 PM",
    minBookingDays: 2,
    amenities: ["24/7 CCTV", "Loading Dock", "Power Backup"],
  },
  {
    id: "3",
    name: "AgroFrost Centre",
    location: "Ahmednagar, Maharashtra",
    distance: 8.5,
    type: ["Cold"],
    pricePerKgPerDay: 0.55,
    totalCapacity: 20000,
    availableCapacity: 2500,
    rating: 3.9,
    reviewCount: 42,
    verified: false,
    certifications: ["FSSAI Certified"],
    contactPhone: "+91 97654 32109",
    operatingHours: "7:00 AM - 9:00 PM",
    minBookingDays: 3,
    amenities: ["CCTV", "Loading Dock"],
  },
  {
    id: "4",
    name: "Nandi Cold Chain",
    location: "Solapur, Maharashtra",
    distance: 12.3,
    type: ["Frozen", "Dairy"],
    pricePerKgPerDay: 0.95,
    totalCapacity: 45000,
    availableCapacity: 28000,
    rating: 4.8,
    reviewCount: 215,
    verified: true,
    certifications: ["FSSAI Certified", "ISO 22000", "HACCP", "Govt Verified"],
    contactPhone: "+91 99876 54321",
    operatingHours: "24 Hours",
    minBookingDays: 1,
    amenities: ["24/7 CCTV", "Loading Dock", "Weighbridge", "Insurance", "Power Backup", "Forklift"],
  },
  {
    id: "5",
    name: "Kisan Seva Storage",
    location: "Satara, Maharashtra",
    distance: 15.0,
    type: ["Cold"],
    pricePerKgPerDay: 0.48,
    totalCapacity: 15000,
    availableCapacity: 8500,
    rating: 4.1,
    reviewCount: 67,
    verified: true,
    certifications: ["FSSAI Certified", "Govt Verified"],
    contactPhone: "+91 98123 45678",
    operatingHours: "6:00 AM - 9:00 PM",
    minBookingDays: 2,
    amenities: ["CCTV", "Loading Dock", "Weighbridge"],
  },
];

export const MOCK_WEATHER: WeatherData = {
  temperature: 34,
  condition: "Hot & Humid",
  humidity: 72,
  suggestion: "High spoilage risk. Consider cold storage for perishables within 6 hours.",
  icon: "sunny",
};

export const MOCK_INSIGHTS: Insight[] = [
  {
    id: "i1",
    type: "weather",
    title: "Heatwave Alert",
    message: "Temperature expected to reach 42 C this week. Store perishables immediately to avoid spoilage losses.",
    severity: "danger",
    icon: "thermometer",
    timestamp: new Date().toISOString(),
  },
  {
    id: "i2",
    type: "market",
    title: "Tomato Prices Rising",
    message: "Tomato prices up 18% in Nashik APMC. Consider storing for 3-5 more days for better returns.",
    severity: "info",
    icon: "trending-up",
    timestamp: new Date().toISOString(),
  },
  {
    id: "i3",
    type: "demand",
    title: "High Storage Demand",
    message: "Cold storage utilization at 85% in your district. Book early to secure capacity.",
    severity: "warning",
    icon: "alert-circle",
    timestamp: new Date().toISOString(),
  },
  {
    id: "i4",
    type: "market",
    title: "Onion Export Ban Lifted",
    message: "Export restrictions removed. Prices expected to stabilize. Good time to sell existing stock.",
    severity: "info",
    icon: "globe",
    timestamp: new Date().toISOString(),
  },
  {
    id: "i5",
    type: "weather",
    title: "Heavy Rain Expected",
    message: "IMD predicts heavy rainfall in 48 hours. Ensure produce is stored safely. Avoid transport.",
    severity: "warning",
    icon: "cloud-rain",
    timestamp: new Date().toISOString(),
  },
];

export const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    home: "Home",
    bookings: "Bookings",
    insights: "Insights",
    profile: "Profile",
    nearbyStorage: "Nearby Storage",
    viewAndBook: "View & Book",
    weatherAdvisory: "Weather Advisory",
    activeBookings: "Active Bookings",
    pastBookings: "Past Bookings",
    noBookings: "No bookings yet",
    bookNow: "Book Now",
    confirmBooking: "Confirm Booking",
    quantity: "Quantity (kg)",
    duration: "Duration (days)",
    totalCost: "Total Cost",
    available: "Available",
    capacity: "Capacity",
    pricePerDay: "per kg/day",
    verified: "Verified",
    certified: "Certified",
    aiRecommendation: "AI Recommendation",
    settings: "Settings",
    language: "Language",
    bookingSummary: "Booking Summary",
    totalBookings: "Total Bookings",
    activeStorage: "Active Storage",
    totalSaved: "Amount Saved",
    providerDashboard: "Provider Dashboard",
    distance: "km away",
  },
  hi: {
    home: "होम",
    bookings: "बुकिंग",
    insights: "जानकारी",
    profile: "प्रोफाइल",
    nearbyStorage: "नजदीकी भंडारण",
    viewAndBook: "देखें और बुक करें",
    weatherAdvisory: "मौसम सलाह",
    activeBookings: "सक्रिय बुकिंग",
    pastBookings: "पिछली बुकिंग",
    noBookings: "अभी कोई बुकिंग नहीं",
    bookNow: "अभी बुक करें",
    confirmBooking: "बुकिंग की पुष्टि करें",
    quantity: "मात्रा (किग्रा)",
    duration: "अवधि (दिन)",
    totalCost: "कुल लागत",
    available: "उपलब्ध",
    capacity: "क्षमता",
    pricePerDay: "प्रति किग्रा/दिन",
    verified: "सत्यापित",
    certified: "प्रमाणित",
    aiRecommendation: "AI सिफारिश",
    settings: "सेटिंग्स",
    language: "भाषा",
    bookingSummary: "बुकिंग सारांश",
    totalBookings: "कुल बुकिंग",
    activeStorage: "सक्रिय भंडारण",
    totalSaved: "बचत राशि",
    providerDashboard: "प्रदाता डैशबोर्ड",
    distance: "किमी दूर",
  },
  te: {
    home: "హోమ్",
    bookings: "బుకింగ్‌లు",
    insights: "అంతర్దృష్టులు",
    profile: "ప్రొఫైల్",
    nearbyStorage: "సమీపంలోని నిల్వ",
    viewAndBook: "చూడండి & బుక్ చేయండి",
    weatherAdvisory: "వాతావరణ సలహా",
    activeBookings: "యాక్టివ్ బుకింగ్‌లు",
    pastBookings: "గత బుకింగ్‌లు",
    noBookings: "ఇంకా బుకింగ్‌లు లేవు",
    bookNow: "ఇప్పుడు బుక్ చేయండి",
    confirmBooking: "బుకింగ్ నిర్ధారించండి",
    quantity: "పరిమాణం (కేజీ)",
    duration: "వ్యవధి (రోజులు)",
    totalCost: "మొత్తం ఖర్చు",
    available: "అందుబాటులో",
    capacity: "సామర్థ్యం",
    pricePerDay: "ప్రతి కేజీ/రోజు",
    verified: "ధృవీకరించబడింది",
    certified: "సర్టిఫైడ్",
    aiRecommendation: "AI సిఫారసు",
    settings: "సెట్టింగ్‌లు",
    language: "భాష",
    bookingSummary: "బుకింగ్ సారాంశం",
    totalBookings: "మొత్తం బుకింగ్‌లు",
    activeStorage: "యాక్టివ్ నిల్వ",
    totalSaved: "ఆదా చేసిన మొత్తం",
    providerDashboard: "ప్రొవైడర్ డాష్‌బోర్డ్",
    distance: "కి.మీ దూరంలో",
  },
};
