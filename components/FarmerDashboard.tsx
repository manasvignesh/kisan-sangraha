import React, { useState, useMemo } from "react";
import { StyleSheet, Text, View, ScrollView, Platform, ActivityIndicator, TouchableOpacity, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import CalendarStrip from "@/components/CalendarStrip";
import WeatherCard from "@/components/WeatherCard";
import StorageCard from "@/components/StorageCard";
import AiRecommendationCard from "@/components/AiRecommendationCard";
import { useApp, useTranslation } from "@/lib/context";
import { useQuery } from "@tanstack/react-query";
import { getApiUrl, apiFetch } from "@/lib/query-client";

// Manual city fallback
const CITIES = [
    { name: "Pune, Maharashtra", lat: 18.52, lon: 73.85 },
    { name: "Nashik, Maharashtra", lat: 20.01, lon: 73.79 },
    { name: "Aurangabad, Maharashtra", lat: 19.88, lon: 75.34 },
    { name: "Mumbai, Maharashtra", lat: 19.08, lon: 72.88 },
    { name: "Hyderabad, Telangana", lat: 17.38, lon: 78.47 },
    { name: "Bangalore, Karnataka", lat: 12.97, lon: 77.59 },
    { name: "Delhi, NCR", lat: 28.61, lon: 77.23 },
];

const isSameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

export default function FarmerDashboard() {
    const insets = useSafeAreaInsets();
    const { facilities, bookings, user, userLocation, locationLoading, userProfile } = useApp();
    const t = useTranslation();
    const webTopInset = Platform.OS === "web" ? 67 : 0;

    // ── Date selection state ─────────────────────────────────────────────────────
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [showCityPicker, setShowCityPicker] = useState(false);

    const today = new Date();
    const isToday = isSameDay(selectedDate, today);
    const isFuture = selectedDate > today;

    // ── Weather query — re-fetches automatically when selectedDate changes ────────
    const { data: weather } = useQuery({
        queryKey: ["/api/weather", userLocation?.lat, userLocation?.lon, selectedDate.toDateString()],
        queryFn: async () => {
            const url = new URL("/api/weather", getApiUrl());
            if (userLocation?.lat) {
                url.searchParams.set("lat", userLocation.lat.toString());
                url.searchParams.set("lon", userLocation.lon.toString());
            }
            // For future/past dates, add date param (backend will use it for context)
            if (!isToday) {
                url.searchParams.set("date", selectedDate.toISOString().split("T")[0]);
            }
            const res = await apiFetch(url.toString(), { credentials: "include" });
            if (!res.ok) return null;
            return res.json();
        },
        staleTime: 5 * 60 * 1000,
    });

    // ── Filter bookings for selected date ─────────────────────────────────────────
    const dateBookings = useMemo(() => {
        return bookings.filter((b) => {
            const start = new Date(b.startDate);
            const end = new Date(b.endDate);
            return selectedDate >= start && selectedDate <= end;
        });
    }, [bookings, selectedDate]);

    // ── Sort facilities by distance ────────────────────────────────────────────────
    const sortedFacilities = useMemo(
        () => [...facilities].sort((a, b) => (a.distance ?? 99) - (b.distance ?? 99)),
        [facilities]
    );

    // ── AI context: shift recommendation text for future/past ─────────────────────
    const aiCropHint = isFuture
        ? `planning ahead for ${selectedDate.toLocaleDateString("en-IN", { weekday: "long", month: "short", day: "numeric" })}`
        : isToday
            ? "today's produce"
            : "previously stored produce";

    return (
        <>
            <ScrollView
                style={styles.container}
                contentContainerStyle={[
                    styles.content,
                    { paddingTop: insets.top + webTopInset + 16, paddingBottom: insets.bottom + 100 },
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Header ── */}
                <View style={styles.headerRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.greeting}>Namaste, {user?.username || "Kisan"}!</Text>
                        <TouchableOpacity style={styles.locationRow} onPress={() => setShowCityPicker(true)}>
                            <Feather name="map-pin" size={13} color={Colors.primary} />
                            {locationLoading ? (
                                <>
                                    <ActivityIndicator size="small" color={Colors.primary} />
                                    <Text style={styles.locationText}>Detecting location...</Text>
                                </>
                            ) : (
                                <>
                                    <Text style={styles.locationText}>{userProfile.location}</Text>
                                    <Feather name="chevron-down" size={12} color={Colors.primary} />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                    <View style={styles.avatarCircle}>
                        <Feather name="user" size={20} color={Colors.primary} />
                    </View>
                </View>

                {/* ── Calendar Strip — controlled & interactive ── */}
                <CalendarStrip
                    selectedDate={selectedDate}
                    onDateSelect={(date) => {
                        setSelectedDate(date);
                    }}
                />

                {/* ── Date context banner (for non-today dates) ── */}
                {!isToday && (
                    <View style={[styles.dateBanner, isFuture && styles.dateBannerFuture]}>
                        <Feather
                            name={isFuture ? "calendar" : "clock"}
                            size={14}
                            color={isFuture ? Colors.info : Colors.textSecondary}
                        />
                        <Text style={[styles.dateBannerText, isFuture && styles.dateBannerTextFuture]}>
                            {isFuture
                                ? `Viewing forecast for ${selectedDate.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}`
                                : `Viewing data for ${selectedDate.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}`}
                        </Text>
                    </View>
                )}

                {/* ── Weather Advisory ── */}
                <View style={styles.sectionHeader}>
                    <Feather name="cloud" size={16} color={Colors.warning} />
                    <Text style={styles.sectionTitle}>{t("weatherAdvisory")}</Text>
                </View>
                <WeatherCard selectedDate={selectedDate} />

                {/* ── AI Storage Advisory ── */}
                <View style={styles.sectionHeader}>
                    <Feather name="cpu" size={16} color={Colors.verified} />
                    <Text style={styles.sectionTitle}>AI Storage Advisory</Text>
                </View>
                <AiRecommendationCard
                    temperature={weather?.temperature}
                    humidity={weather?.humidity}
                    cropType={aiCropHint}
                    selectedDate={selectedDate}
                />

                {/* ── Bookings on selected date ── */}
                {dateBookings.length > 0 && (
                    <>
                        <View style={styles.sectionHeader}>
                            <Feather name="package" size={16} color={Colors.success} />
                            <Text style={styles.sectionTitle}>Active Bookings</Text>
                            <View style={styles.countBadgeWrap}>
                                <Text style={styles.countBadge}>{dateBookings.length}</Text>
                            </View>
                        </View>
                        {dateBookings.map((b) => (
                            <View key={b.id} style={styles.bookingCard}>
                                <View style={styles.bookingRow}>
                                    <View style={styles.bookingIconWrap}>
                                        <Feather name="package" size={16} color={Colors.success} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.bookingFacility}>{b.facilityName}</Text>
                                        <Text style={styles.bookingMeta}>{b.quantity} kg · {b.duration} days · {b.storageType}</Text>
                                    </View>
                                    <View style={[styles.statusPill, b.status === "active" ? styles.statusActive : styles.statusPending]}>
                                        <Text style={[styles.statusText, b.status === "active" ? styles.statusActiveText : styles.statusPendingText]}>
                                            {b.status === "active" ? "Active" : "Pending"}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </>
                )}

                {/* ── If no bookings for selected date (and not today) ── */}
                {!isToday && dateBookings.length === 0 && (
                    <View style={styles.emptyDateCard}>
                        <Feather name="calendar" size={24} color={Colors.textTertiary} />
                        <Text style={styles.emptyDateText}>
                            No bookings or alerts for{" "}
                            {isSameDay(selectedDate, today)
                                ? "today"
                                : selectedDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </Text>
                        <Text style={styles.emptyDateSub}>Browse nearby facilities below to book storage</Text>
                    </View>
                )}

                {/* ── Nearby Storage ── */}
                <View style={styles.sectionHeader}>
                    <Feather name="grid" size={16} color={Colors.primary} />
                    <Text style={styles.sectionTitle}>{t("nearbyStorage")}</Text>
                    <View style={styles.countBadgeWrap}>
                        <Text style={styles.countBadge}>{sortedFacilities.length}</Text>
                    </View>
                </View>

                {sortedFacilities.length === 0 ? (
                    <View style={styles.emptyState}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                        <Text style={styles.emptyText}>Loading storage facilities...</Text>
                    </View>
                ) : (
                    sortedFacilities.map((facility) => (
                        <StorageCard key={facility.id} facility={facility as any} />
                    ))
                )}
            </ScrollView>

            {/* ── Manual City Picker Modal ── */}
            <Modal visible={showCityPicker} animationType="slide" transparent>
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalSheet}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>Select Your Location</Text>
                        <Text style={styles.modalSub}>Tap a city to update nearby storage results</Text>
                        {CITIES.map((city) => (
                            <TouchableOpacity
                                key={city.name}
                                style={[
                                    styles.cityRow,
                                    userProfile.location === city.name && styles.cityRowActive,
                                ]}
                                onPress={() => setShowCityPicker(false)}
                            >
                                <Feather name="map-pin" size={14} color={userProfile.location === city.name ? Colors.primary : Colors.textSecondary} />
                                <Text style={[styles.cityText, userProfile.location === city.name && styles.cityTextActive]}>
                                    {city.name}
                                </Text>
                                {userProfile.location === city.name && (
                                    <Feather name="check" size={14} color={Colors.primary} style={{ marginLeft: "auto" as any }} />
                                )}
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCityPicker(false)}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { paddingHorizontal: 16, gap: 14 },

    headerRow: { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "center" as const, marginBottom: 4 },
    greeting: { fontSize: 26, fontFamily: "NunitoSans_800ExtraBold", color: Colors.text },
    locationRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 4, marginTop: 3 },
    locationText: { fontSize: 13, fontFamily: "NunitoSans_600SemiBold", color: Colors.primary },
    avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryLight, alignItems: "center" as const, justifyContent: "center" as const },

    // Date banner for non-today
    dateBanner: { flexDirection: "row" as const, alignItems: "center" as const, gap: 8, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.borderLight, borderRadius: 10, padding: 10 },
    dateBannerFuture: { backgroundColor: Colors.infoLight, borderColor: Colors.info + "30" },
    dateBannerText: { fontSize: 13, fontFamily: "NunitoSans_600SemiBold", color: Colors.textSecondary, flex: 1 },
    dateBannerTextFuture: { color: Colors.info },

    sectionHeader: { flexDirection: "row" as const, alignItems: "center" as const, gap: 8 },
    sectionTitle: { fontSize: 17, fontFamily: "NunitoSans_700Bold", color: Colors.text, flex: 1 },
    countBadgeWrap: { backgroundColor: Colors.primaryLight, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
    countBadge: { fontSize: 13, fontFamily: "NunitoSans_700Bold", color: Colors.primary },

    // Booking card for selected date
    bookingCard: { backgroundColor: "#fff", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.borderLight },
    bookingRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 10 },
    bookingIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.successLight, alignItems: "center" as const, justifyContent: "center" as const },
    bookingFacility: { fontSize: 14, fontFamily: "NunitoSans_700Bold", color: Colors.text },
    bookingMeta: { fontSize: 12, fontFamily: "NunitoSans_600SemiBold", color: Colors.textSecondary, marginTop: 2 },
    statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    statusActive: { backgroundColor: Colors.successLight },
    statusPending: { backgroundColor: Colors.warningLight },
    statusText: { fontSize: 11, fontFamily: "NunitoSans_700Bold" },
    statusActiveText: { color: Colors.success },
    statusPendingText: { color: Colors.warning },

    // Empty date state
    emptyDateCard: { backgroundColor: "#fff", borderRadius: 14, padding: 20, alignItems: "center" as const, gap: 6, borderWidth: 1, borderColor: Colors.borderLight, borderStyle: "dashed" },
    emptyDateText: { fontSize: 14, fontFamily: "NunitoSans_700Bold", color: Colors.textSecondary },
    emptyDateSub: { fontSize: 12, fontFamily: "NunitoSans_400Regular", color: Colors.textTertiary },

    emptyState: { alignItems: "center" as const, paddingVertical: 40, gap: 12 },
    emptyText: { fontSize: 14, fontFamily: "NunitoSans_600SemiBold", color: Colors.textSecondary },

    // City Picker Modal
    modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" as const },
    modalSheet: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, gap: 4 },
    modalHandle: { width: 40, height: 5, borderRadius: 3, backgroundColor: Colors.borderLight, alignSelf: "center" as const, marginBottom: 12 },
    modalTitle: { fontSize: 18, fontFamily: "NunitoSans_800ExtraBold", color: Colors.text, marginBottom: 4 },
    modalSub: { fontSize: 13, fontFamily: "NunitoSans_400Regular", color: Colors.textSecondary, marginBottom: 12 },
    cityRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 10, paddingVertical: 13, paddingHorizontal: 12, borderRadius: 10 },
    cityRowActive: { backgroundColor: Colors.primaryLight },
    cityText: { fontSize: 15, fontFamily: "NunitoSans_600SemiBold", color: Colors.text },
    cityTextActive: { color: Colors.primary, fontFamily: "NunitoSans_700Bold" },
    cancelBtn: { marginTop: 8, paddingVertical: 12, alignItems: "center" as const, backgroundColor: Colors.background, borderRadius: 12 },
    cancelBtnText: { fontSize: 15, fontFamily: "NunitoSans_700Bold", color: Colors.textSecondary },
});
