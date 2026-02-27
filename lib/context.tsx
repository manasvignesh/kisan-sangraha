import React, { createContext, useContext, useState, useMemo, useCallback, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Booking, MOCK_FACILITIES, StorageFacility } from "@/constants/data";

type Language = "en" | "hi" | "te";
type UserRole = "farmer" | "provider";

interface UserProfile {
  name: string;
  location: string;
  phone: string;
}

interface AppContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  userProfile: UserProfile;
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  facilities: StorageFacility[];
  updateFacilityCapacity: (facilityId: string, quantityBooked: number) => void;
  setFacilityAvailability: (facilityId: string, newAvailableCapacity: number) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEYS = {
  LANGUAGE: "@kisan_language",
  ROLE: "@kisan_role",
  BOOKINGS: "@kisan_bookings",
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [role, setRoleState] = useState<UserRole>("farmer");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [facilities, setFacilities] = useState<StorageFacility[]>(MOCK_FACILITIES);

  const userProfile: UserProfile = {
    name: "Rajesh Kumar",
    location: "Nashik, Maharashtra",
    phone: "+91 98765 43210",
  };

  useEffect(() => {
    (async () => {
      try {
        const [savedLang, savedRole, savedBookings] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE),
          AsyncStorage.getItem(STORAGE_KEYS.ROLE),
          AsyncStorage.getItem(STORAGE_KEYS.BOOKINGS),
        ]);
        if (savedLang) setLanguageState(savedLang as Language);
        if (savedRole) setRoleState(savedRole as UserRole);
        if (savedBookings) setBookings(JSON.parse(savedBookings));
      } catch (e) {
        console.error("Failed to load saved data:", e);
      }
    })();
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  }, []);

  const setRole = useCallback(async (role: UserRole) => {
    setRoleState(role);
    await AsyncStorage.setItem(STORAGE_KEYS.ROLE, role);
  }, []);

  const addBooking = useCallback(async (booking: Booking) => {
    setBookings((prev) => {
      const updated = [booking, ...prev];
      AsyncStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateFacilityCapacity = useCallback((facilityId: string, quantityBooked: number) => {
    setFacilities((prev) =>
      prev.map((f) =>
        f.id === facilityId
          ? { ...f, availableCapacity: Math.max(0, f.availableCapacity - quantityBooked) }
          : f
      )
    );
  }, []);

  const setFacilityAvailability = useCallback((facilityId: string, newAvailableCapacity: number) => {
    setFacilities((prev) =>
      prev.map((f) =>
        f.id === facilityId
          ? { ...f, availableCapacity: Math.min(f.totalCapacity, Math.max(0, newAvailableCapacity)) }
          : f
      )
    );
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      role,
      setRole,
      userProfile,
      bookings,
      addBooking,
      facilities,
      updateFacilityCapacity,
      setFacilityAvailability,
    }),
    [language, role, bookings, facilities, setLanguage, setRole, addBooking, updateFacilityCapacity, setFacilityAvailability]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}

export function useTranslation() {
  const { language } = useApp();
  const { TRANSLATIONS } = require("@/constants/data");
  return useCallback(
    (key: string) => TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || key,
    [language]
  );
}
