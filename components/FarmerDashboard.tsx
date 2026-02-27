import React from "react";
import { StyleSheet, Text, View, ScrollView, Platform, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import CalendarStrip from "@/components/CalendarStrip";
import WeatherCard from "@/components/WeatherCard";
import StorageCard from "@/components/StorageCard";
import { useApp, useTranslation } from "@/lib/context";

export default function FarmerDashboard() {
    const insets = useSafeAreaInsets();
    const { facilities, userProfile, user, userLocation, locationLoading } = useApp();
    const t = useTranslation();
    const webTopInset = Platform.OS === "web" ? 67 : 0;

    // Sort facilities by distance (already sorted by backend; client-side as safety)
    const sortedFacilities = [...facilities].sort((a, b) => (a.distance ?? 99) - (b.distance ?? 99));

    // Always show at least the available facilities — backend seeds demo data if DB empty
    const displayFacilities = sortedFacilities;

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={[
                styles.content,
                { paddingTop: insets.top + webTopInset + 16, paddingBottom: insets.bottom + 100 },
            ]}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.headerRow}>
                <View>
                    <Text style={styles.greeting}>Namaste, {user?.username || "Kisan"}!</Text>
                    <View style={styles.locationRow}>
                        <Feather name="map-pin" size={13} color={Colors.primary} />
                        {locationLoading ? (
                            <ActivityIndicator size="small" color={Colors.primary} style={{ marginLeft: 4 }} />
                        ) : (
                            <Text style={styles.locationText}>{userProfile.location}</Text>
                        )}
                    </View>
                </View>
                <View style={styles.avatarCircle}>
                    <Feather name="user" size={20} color={Colors.primary} />
                </View>
            </View>

            <CalendarStrip />

            {/* Weather Advisory */}
            <View style={styles.sectionHeader}>
                <Feather name="cloud" size={16} color={Colors.warning} />
                <Text style={styles.sectionTitle}>{t("weatherAdvisory")}</Text>
            </View>
            <WeatherCard />

            {/* Nearby Storage */}
            <View style={styles.sectionHeader}>
                <Feather name="grid" size={16} color={Colors.primary} />
                <Text style={styles.sectionTitle}>{t("nearbyStorage")}</Text>
                <View style={styles.countBadgeWrap}>
                    <Text style={styles.countBadge}>{displayFacilities.length}</Text>
                </View>
            </View>

            {displayFacilities.length === 0 ? (
                <View style={styles.emptyState}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.emptyText}>Loading storage facilities...</Text>
                </View>
            ) : (
                displayFacilities.map((facility) => (
                    <StorageCard key={facility.id} facility={facility as any} />
                ))
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        paddingHorizontal: 16,
        gap: 14,
    },
    headerRow: {
        flexDirection: "row" as const,
        justifyContent: "space-between" as const,
        alignItems: "center" as const,
        marginBottom: 4,
    },
    greeting: {
        fontSize: 26,
        fontFamily: "NunitoSans_800ExtraBold",
        color: Colors.text,
    },
    locationRow: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        gap: 4,
        marginTop: 2,
    },
    locationText: {
        fontSize: 13,
        fontFamily: "NunitoSans_600SemiBold",
        color: Colors.primary,
    },
    avatarCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primaryLight,
        alignItems: "center" as const,
        justifyContent: "center" as const,
    },
    sectionHeader: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 17,
        fontFamily: "NunitoSans_700Bold",
        color: Colors.text,
        flex: 1,
    },
    countBadgeWrap: {
        backgroundColor: Colors.primaryLight,
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 10,
    },
    countBadge: {
        fontSize: 13,
        fontFamily: "NunitoSans_700Bold",
        color: Colors.primary,
    },
    emptyState: {
        alignItems: "center" as const,
        paddingVertical: 40,
        gap: 12,
    },
    emptyText: {
        fontSize: 14,
        fontFamily: "NunitoSans_600SemiBold",
        color: Colors.textSecondary,
    },
});
