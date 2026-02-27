import React from "react";
import { StyleSheet, Text, View, ScrollView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import CalendarStrip from "@/components/CalendarStrip";
import WeatherCard from "@/components/WeatherCard";
import StorageCard from "@/components/StorageCard";
import { useApp, useTranslation } from "@/lib/context";

export default function FarmerDashboard() {
    const insets = useSafeAreaInsets();
    const { facilities, userProfile } = useApp();
    const t = useTranslation();
    const webTopInset = Platform.OS === "web" ? 67 : 0;

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={[
                styles.content,
                { paddingTop: insets.top + webTopInset + 16, paddingBottom: insets.bottom + 100 },
            ]}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.headerRow}>
                <View>
                    <Text style={styles.greeting}>Namaste!</Text>
                    <View style={styles.locationRow}>
                        <Feather name="map-pin" size={13} color={Colors.primary} />
                        <Text style={styles.locationText}>{userProfile.location}</Text>
                    </View>
                </View>
                <View style={styles.avatarCircle}>
                    <Feather name="user" size={20} color={Colors.primary} />
                </View>
            </View>

            <CalendarStrip />

            <View style={styles.sectionHeader}>
                <Feather name="cloud" size={16} color={Colors.warning} />
                <Text style={styles.sectionTitle}>{t("weatherAdvisory")}</Text>
            </View>
            <WeatherCard />

            <View style={styles.sectionHeader}>
                <Feather name="grid" size={16} color={Colors.primary} />
                <Text style={styles.sectionTitle}>{t("nearbyStorage")}</Text>
                <Text style={styles.countBadge}>{facilities.length}</Text>
            </View>

            {facilities.map((facility) => (
                <StorageCard key={facility.id} facility={facility} />
            ))}
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
        fontFamily: "NunitoSans_400Regular",
        color: Colors.textSecondary,
    },
    avatarCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primaryLight,
        alignItems: "center" as const,
        justifyContent: "center" as const,
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    sectionHeader: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        gap: 8,
        marginTop: 6,
    },
    sectionTitle: {
        fontSize: 17,
        fontFamily: "NunitoSans_700Bold",
        color: Colors.text,
        flex: 1,
    },
    countBadge: {
        fontSize: 12,
        fontFamily: "NunitoSans_700Bold",
        color: Colors.primary,
        backgroundColor: Colors.primaryLight,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        overflow: "hidden" as const,
    },
});
