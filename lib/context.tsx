import React, { createContext, useContext, useState, useMemo, useCallback, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TRANSLATIONS } from "@/constants/data";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Facility, BookingType, User } from "@shared/schema";

type Language = "en" | "hi" | "te";
type UserRole = "farmer" | "provider";

interface AppContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  facilities: Facility[];
  bookings: BookingType[];
  addBooking: (data: any) => Promise<void>;
  updateFacilityCapacity: (facilityId: string, quantityBooked: number) => Promise<void>;
  setFacilityAvailability: (facilityId: string, newAvailableCapacity: number) => Promise<void>;
  updateBookingStatus: (bookingId: string, status: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEYS = {
  LANGUAGE: "@kisan_language",
};

export function AppProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [language, setLanguageState] = useState<Language>("en");
  const [user, setUser] = useState<User | null>(null);

  // Re-hydrate language from storage
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE)
      .then(lang => {
        if (lang) setLanguageState(lang as Language);
      })
      .catch(console.error);
  }, []);

  // Fetch session on load
  const { data: sessionUser } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch session");
      return res.json();
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (sessionUser !== undefined) {
      setUser(sessionUser as User | null);
    }
  }, [sessionUser]);

  // Global Data Fetching via React Query (only fire if authenticated)
  const isAuthenticated = !!user;
  const role = user?.role as UserRole || "farmer";

  const { data: facilities = [] } = useQuery<Facility[]>({
    queryKey: ["/api/facilities"],
    queryFn: async () => {
      const res = await fetch("/api/facilities");
      if (!res.ok) throw new Error("Failed to fetch facilities");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: bookings = [] } = useQuery<BookingType[]>({
    queryKey: ["/api/bookings"],
    queryFn: async () => {
      const res = await fetch("/api/bookings");
      if (!res.ok) throw new Error("Failed to fetch bookings");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  // Auth Mutations
  const loginMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (data) => {
      setUser(data);
      queryClient.invalidateQueries({ queryKey: ["/api/facilities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: any) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (data) => {
      setUser(data);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/logout", { method: "POST" });
    },
    onSuccess: () => {
      setUser(null);
      queryClient.clear();
    },
  });

  // Data Mutations
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/facilities"] });
    },
  });

  const updateFacilityMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; availableCapacity?: number; pricePerKgPerDay?: number }) => {
      const res = await fetch(`/api/facilities/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/facilities"] });
    },
  });

  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/bookings/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
  });

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      user,
      role,
      isAuthenticated,
      login: async (d: any) => { await loginMutation.mutateAsync(d); },
      register: async (d: any) => { await registerMutation.mutateAsync(d); },
      logout: async () => { await logoutMutation.mutateAsync(); },
      facilities,
      bookings,
      addBooking: async (data: any) => { await createBookingMutation.mutateAsync(data); },
      updateFacilityCapacity: async (facilityId: string, quantityBooked: number) => {
        // Frontend optimistic approach fallback handled by backend POST booking
        console.log("Capacity will be updated directly via the booking payload logic on the backend.");
      },
      setFacilityAvailability: async (facilityId: string, newAvailableCapacity: number) => {
        await updateFacilityMutation.mutateAsync({ id: facilityId, availableCapacity: newAvailableCapacity });
      },
      updateBookingStatus: async (bookingId: string, status: string) => {
        await updateBookingStatusMutation.mutateAsync({ id: bookingId, status });
      }
    }),
    [language, setLanguage, user, role, isAuthenticated, facilities, bookings]
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
  return useCallback(
    (key: string) => TRANSLATIONS[language]?.[key] || TRANSLATIONS["en"]?.[key] || key,
    [language]
  );
}
