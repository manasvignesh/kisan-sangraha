# Kisan ColdChain

A production-grade MVP mobile application that helps small and marginal farmers discover, compare, and book nearby cold storage facilities.

## Architecture

- **Frontend**: Expo React Native with Expo Router (file-based routing)
- **Backend**: Express.js server on port 5000 (landing page + API)
- **Frontend Port**: 8081 (Expo dev server)
- **State Management**: React Context + AsyncStorage for local persistence
- **Fonts**: Nunito Sans (Google Fonts)

## Key Features

1. **Home Dashboard** - Calendar strip, weather advisory, nearby cold storage facility cards with capacity, pricing, ratings
2. **Storage Detail** - Full facility profile, capacity utilization, transparent pricing, AI recommendations
3. **Booking Flow** - Quantity/duration input, dynamic cost calculation, confirmation
4. **My Bookings** - Active/past bookings with status indicators
5. **Insights** - AI-powered weather alerts, market trends, storage demand alerts
6. **Profile** - User profile, multilingual support (English, Hindi, Telugu), settings
7. **Provider Dashboard** - Facility management, booking requests, capacity analytics

## Project Structure

```
app/
  _layout.tsx           # Root layout with providers (fonts, context, query)
  (tabs)/
    _layout.tsx         # Tab layout (Home, Bookings, Insights, Profile)
    index.tsx           # Home dashboard
    bookings.tsx        # My Bookings
    insights.tsx        # Insights/AI advisory
    profile.tsx         # Profile & settings
  storage/[id].tsx      # Storage detail screen
  booking/[id].tsx      # Booking flow screen
  provider/index.tsx    # Provider dashboard

components/
  CalendarStrip.tsx     # Weekly calendar component
  WeatherCard.tsx       # Weather advisory card
  StorageCard.tsx       # Cold storage facility card
  InsightCard.tsx       # Insight/alert card
  BookingCard.tsx       # Booking details card
  ErrorBoundary.tsx     # Error boundary component
  ErrorFallback.tsx     # Error fallback UI

constants/
  colors.ts             # Theme colors (green agri-tech palette)
  data.ts               # Mock data, types, translations

lib/
  context.tsx           # App context (language, role, bookings, facilities)
  query-client.ts       # React Query client config

server/
  index.ts              # Express server setup
  routes.ts             # API routes
  storage.ts            # Storage layer
```

## Dependencies

- @expo-google-fonts/nunito-sans (custom typography)
- @react-native-async-storage/async-storage (local persistence)
- expo-haptics (touch feedback)
- expo-router (file-based navigation)
- expo-glass-effect (liquid glass tab bar for iOS 26+)
- @tanstack/react-query (data fetching)

## Design

- Soft muted green palette (#1B6B3A primary)
- Color-coded availability (green/orange/red)
- Icon-driven navigation for accessibility
- Multilingual support: English, Hindi, Telugu
