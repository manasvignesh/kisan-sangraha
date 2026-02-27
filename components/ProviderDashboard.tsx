import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, Platform, TouchableOpacity, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useApp } from "@/lib/context";

export default function ProviderDashboard() {
    const insets = useSafeAreaInsets();
    const { facilities, user, bookings, setFacilityAvailability, updateBookingStatus } = useApp();
    const webTopInset = Platform.OS === "web" ? 67 : 0;

    // Assuming the provider owns the first facility for demonstration
    const facility = facilities[0];
    const utilizationRate = facility ? Math.round(((facility.totalCapacity - facility.availableCapacity) / facility.totalCapacity) * 100) : 0;

    // Filter incoming bookings
    const incomingBookings = bookings.filter((b: any) => b.status === "active" && b.facilityId === facility?.id);

    // Mocking update states
    const [isEditingPrice, setIsEditingPrice] = useState(false);
    const [price, setPrice] = useState(facility ? facility.pricePerKgPerDay.toString() : "0");

    const handleUpdatePrice = async () => {
        if (!facility) return;
        try {
            await setFacilityAvailability(facility.id, facility.availableCapacity); // Preserving capacity
            // Not actually hooked to price update yet in API signature, but simulated success UI bounce
            setIsEditingPrice(false);
        } catch (e) {
            console.error(e);
        }
    };

    if (!facility) {
        return (
            <View style={[styles.container, { padding: 40 }]}>
                <Text style={{ textAlign: "center", fontSize: 16 }}>No Facilities Managed Found.</Text>
            </View>
        )
    }

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
                    <Text style={styles.greeting}>Namaste, {user?.username || "Provider"}!</Text>
                    <Text style={styles.roleText}>Cold Storage Owner</Text>
                </View>
                <View style={styles.avatarCircle}>
                    <Ionicons name="business" size={20} color={Colors.primary} />
                </View>
            </View>

            <View style={styles.sectionHeader}>
                <Ionicons name="business-outline" size={18} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Facility Overview</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.facilityName}>{facility.name}</Text>
                <View style={styles.locationRow}>
                    <Feather name="map-pin" size={14} color={Colors.textSecondary} />
                    <Text style={styles.facilityLocation}>{facility.location}</Text>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Available</Text>
                        <Text style={[styles.statValue, { color: Colors.availabilityHigh }]}>{facility.availableCapacity} MT</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Total</Text>
                        <Text style={styles.statValue}>{facility.totalCapacity} MT</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Utilization</Text>
                        <Text style={[styles.statValue, { color: Colors.warning }]}>{utilizationRate}%</Text>
                    </View>
                </View>
            </View>

            <View style={styles.sectionHeader}>
                <Ionicons name="pricetag-outline" size={18} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Manage Pricing</Text>
            </View>

            <View style={styles.cardRow}>
                <View style={styles.priceContainer}>
                    <Text style={styles.priceSymbol}>₹</Text>
                    {isEditingPrice ? (
                        <TextInput
                            style={styles.priceInput}
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                            autoFocus
                        />
                    ) : (
                        <Text style={styles.priceValue}>{price}</Text>
                    )}
                    <Text style={styles.priceUnit}>/ kg/day</Text>
                </View>

                {isEditingPrice ? (
                    <TouchableOpacity style={styles.updateButton} onPress={handleUpdatePrice}>
                        <Text style={styles.updateButtonText}>Save</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.editButton} onPress={() => setIsEditingPrice(true)}>
                        <Text style={styles.editButtonText}>Edit</Text>
                        <Feather name="edit-2" size={14} color={Colors.primary} />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.sectionHeader}>
                <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Incoming Requests</Text>
                {incomingBookings.length > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{incomingBookings.length} New</Text>
                    </View>
                )}
            </View>

            {incomingBookings.length === 0 && (
                <Text style={{ color: Colors.textSecondary, marginBottom: 16 }}>No incoming requests currently.</Text>
            )}

            {incomingBookings.map((req: any) => (
                <View key={req.id} style={[styles.requestCard, { marginBottom: 12 }]}>
                    <View style={styles.requestHeader}>
                        <View style={styles.requestUser}>
                            <View style={styles.requestAvatar}>
                                <Text style={styles.requestAvatarText}>F</Text>
                            </View>
                            <View>
                                <Text style={styles.requestName}>Farmer #{req.userId}</Text>
                                <Text style={styles.requestCrop}>{req.storageType || "Produce"} • {req.quantity} MT</Text>
                            </View>
                        </View>
                        <Text style={styles.requestDuration}>{req.duration} Days</Text>
                    </View>
                    <View style={styles.requestActions}>
                        <TouchableOpacity style={[styles.actionBtn, styles.declineBtn]} onPress={() => updateBookingStatus(req.id, "cancelled")}>
                            <Text style={styles.declineBtnText}>Decline</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={() => updateBookingStatus(req.id, "completed")}>
                            <Text style={styles.acceptBtnText}>Accept</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ))}

            <View style={styles.sectionHeader}>
                <Ionicons name="bar-chart-outline" size={18} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Monthly Analytics</Text>
            </View>

            <View style={styles.analyticsGrid}>
                <View style={styles.analyticsBox}>
                    <Text style={styles.analyticsValue}>{bookings.length}</Text>
                    <Text style={styles.analyticsLabel}>Total Bookings</Text>
                </View>
                <View style={styles.analyticsBox}>
                    <Text style={styles.analyticsValue}>
                        ₹{(bookings.reduce((sum, b) => sum + b.totalCost, 0) / 1000).toFixed(1)}k
                    </Text>
                    <Text style={styles.analyticsLabel}>Est. Revenue</Text>
                </View>
            </View>

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
        gap: 16,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    greeting: {
        fontSize: 24,
        fontFamily: "NunitoSans_800ExtraBold",
        color: Colors.text,
    },
    roleText: {
        fontSize: 14,
        fontFamily: "NunitoSans_600SemiBold",
        color: Colors.primary,
        marginTop: 2,
    },
    avatarCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primaryLight,
        alignItems: "center",
        justifyContent: "center",
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: "NunitoSans_700Bold",
        color: Colors.text,
        flex: 1,
    },
    badge: {
        backgroundColor: Colors.dangerLight,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        color: Colors.danger,
        fontSize: 12,
        fontFamily: "NunitoSans_700Bold",
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    facilityName: {
        fontSize: 20,
        fontFamily: "NunitoSans_700Bold",
        color: Colors.text,
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 4,
        marginBottom: 16,
    },
    facilityLocation: {
        fontSize: 14,
        fontFamily: "NunitoSans_600SemiBold",
        color: Colors.textSecondary,
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: Colors.background,
        borderRadius: 12,
        padding: 12,
    },
    statBox: {
        flex: 1,
        alignItems: "center",
        gap: 4,
    },
    statLabel: {
        fontSize: 12,
        fontFamily: "NunitoSans_600SemiBold",
        color: Colors.textSecondary,
    },
    statValue: {
        fontSize: 16,
        fontFamily: "NunitoSans_800ExtraBold",
        color: Colors.text,
    },
    divider: {
        width: 1,
        height: 32,
        backgroundColor: Colors.border,
    },
    cardRow: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    priceContainer: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: 2,
    },
    priceSymbol: {
        fontSize: 18,
        fontFamily: "NunitoSans_700Bold",
        color: Colors.textSecondary,
    },
    priceValue: {
        fontSize: 28,
        fontFamily: "NunitoSans_800ExtraBold",
        color: Colors.text,
    },
    priceInput: {
        fontSize: 28,
        fontFamily: "NunitoSans_800ExtraBold",
        color: Colors.primary,
        borderBottomWidth: 1,
        borderColor: Colors.primary,
        minWidth: 60,
        padding: 0,
        margin: 0,
    },
    priceUnit: {
        fontSize: 14,
        fontFamily: "NunitoSans_600SemiBold",
        color: Colors.textSecondary,
        marginLeft: 4,
    },
    editButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.primaryLight,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    editButtonText: {
        color: Colors.primary,
        fontFamily: "NunitoSans_700Bold",
        fontSize: 14,
    },
    updateButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    updateButtonText: {
        color: "#fff",
        fontFamily: "NunitoSans_700Bold",
        fontSize: 14,
    },
    requestCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    requestHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 16,
    },
    requestUser: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    requestAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.frost,
        alignItems: "center",
        justifyContent: "center",
    },
    requestAvatarText: {
        fontSize: 16,
        fontFamily: "NunitoSans_800ExtraBold",
        color: Colors.frostDark,
    },
    requestName: {
        fontSize: 16,
        fontFamily: "NunitoSans_700Bold",
        color: Colors.text,
    },
    requestCrop: {
        fontSize: 13,
        fontFamily: "NunitoSans_600SemiBold",
        color: Colors.textSecondary,
        marginTop: 2,
    },
    requestDuration: {
        fontSize: 14,
        fontFamily: "NunitoSans_700Bold",
        color: Colors.primary,
        backgroundColor: Colors.primaryLight,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    requestActions: {
        flexDirection: "row",
        gap: 12,
    },
    actionBtn: {
        flex: 1,
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    declineBtn: {
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    declineBtnText: {
        color: Colors.textSecondary,
        fontFamily: "NunitoSans_700Bold",
        fontSize: 14,
    },
    acceptBtn: {
        backgroundColor: Colors.primary,
    },
    acceptBtnText: {
        color: "#fff",
        fontFamily: "NunitoSans_700Bold",
        fontSize: 14,
    },
    analyticsGrid: {
        flexDirection: "row",
        gap: 12,
    },
    analyticsBox: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: Colors.borderLight,
        gap: 4,
    },
    analyticsValue: {
        fontSize: 24,
        fontFamily: "NunitoSans_800ExtraBold",
        color: Colors.text,
    },
    analyticsLabel: {
        fontSize: 13,
        fontFamily: "NunitoSans_600SemiBold",
        color: Colors.textSecondary,
    },
});
