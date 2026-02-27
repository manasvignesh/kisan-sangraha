import React, { useState } from "react";
import {
    StyleSheet, Text, View, ScrollView, Platform, TouchableOpacity,
    TextInput, Modal, Alert, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useApp } from "@/lib/context";

const STORAGE_TYPES = ["Cold", "Frozen", "Multi-purpose"] as const;
type StorageType = (typeof STORAGE_TYPES)[number];

export default function ProviderDashboard() {
    const insets = useSafeAreaInsets();
    const { facilities, user, bookings, addFacility, setFacilityAvailability, updateFacilityCapacity, updateBookingStatus } = useApp();
    const webTopInset = Platform.OS === "web" ? 67 : 0;

    // Filter only THIS provider's facilities
    const myFacilities = facilities.filter((f) => f.ownerId === user?.id);
    const primaryFacility = myFacilities[0];

    // Incoming bookings for this provider's facilities
    const myFacilityIds = new Set(myFacilities.map((f) => f.id));
    const pendingBookings = bookings.filter((b) => b.facilityId && myFacilityIds.has(b.facilityId) && b.status === "pending");

    // ── Facility Registration Modal ──
    const [showAddForm, setShowAddForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        name: "",
        location: "",
        type: "Cold" as StorageType,
        totalCapacity: "",
        pricePerKgPerDay: "",
        contactPhone: "",
    });

    const handleAddFacility = async () => {
        if (!form.name || !form.location || !form.totalCapacity || !form.pricePerKgPerDay) {
            Alert.alert("Missing Fields", "Please fill in all required fields.");
            return;
        }
        setSubmitting(true);
        try {
            await addFacility({
                name: form.name,
                location: form.location,
                type: form.type,
                totalCapacity: parseInt(form.totalCapacity),
                availableCapacity: parseInt(form.totalCapacity),
                pricePerKgPerDay: parseFloat(form.pricePerKgPerDay),
                contactPhone: form.contactPhone,
            });
            setShowAddForm(false);
            setForm({ name: "", location: "", type: "Cold", totalCapacity: "", pricePerKgPerDay: "", contactPhone: "" });
        } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to add facility.");
        } finally {
            setSubmitting(false);
        }
    };

    // ── Inline Editing ──
    const [editingPrice, setEditingPrice] = useState<string | null>(null);
    const [editingCapacity, setEditingCapacity] = useState<string | null>(null);
    const [editPriceVal, setEditPriceVal] = useState("");
    const [editCapacityVal, setEditCapacityVal] = useState("");

    const savePrice = async (facilityId: string) => {
        const price = parseFloat(editPriceVal);
        if (!isNaN(price) && price > 0) {
            try {
                await updateFacilityCapacity(facilityId, price);
            } catch { }
        }
        setEditingPrice(null);
    };

    const saveCapacity = async (facilityId: string, currentCapacity: number) => {
        const cap = parseInt(editCapacityVal);
        if (!isNaN(cap) && cap >= 0) {
            try {
                await setFacilityAvailability(facilityId, cap);
            } catch { }
        }
        setEditingCapacity(null);
    };

    // ── Analytics ──
    const totalRevenue = bookings
        .filter((b) => myFacilityIds.has(b.facilityId))
        .reduce((s, b) => s + b.totalCost, 0);

    // ── No Facilities: Registration CTA ──
    if (myFacilities.length === 0) {
        return (
            <ScrollView
                style={styles.container}
                contentContainerStyle={[
                    styles.content,
                    { paddingTop: insets.top + webTopInset + 24, paddingBottom: insets.bottom + 100 },
                ]}
            >
                {/* Header */}
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.greeting}>Namaste, {user?.username || "Provider"}!</Text>
                        <Text style={styles.roleText}>Cold Storage Owner</Text>
                    </View>
                    <View style={styles.avatarCircle}>
                        <Ionicons name="business" size={20} color={Colors.primary} />
                    </View>
                </View>

                {/* Empty State CTA */}
                <View style={styles.emptyCard}>
                    <View style={styles.emptyIconWrap}>
                        <MaterialCommunityIcons name="warehouse" size={48} color={Colors.primary} />
                    </View>
                    <Text style={styles.emptyTitle}>No Facilities Yet</Text>
                    <Text style={styles.emptySubtitle}>
                        Register your cold storage facility to start receiving bookings from farmers in your area.
                    </Text>
                    <TouchableOpacity style={styles.ctaBtn} onPress={() => setShowAddForm(true)}>
                        <Feather name="plus" size={18} color="#fff" />
                        <Text style={styles.ctaBtnText}>Add Storage Facility</Text>
                    </TouchableOpacity>
                </View>

                {/* Add Facility Modal */}
                <AddFacilityModal
                    visible={showAddForm}
                    form={form}
                    setForm={setForm}
                    submitting={submitting}
                    onSubmit={handleAddFacility}
                    onClose={() => setShowAddForm(false)}
                />
            </ScrollView>
        );
    }

    // ── Main Dashboard ──
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
                {/* Header */}
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.greeting}>Namaste, {user?.username || "Provider"}!</Text>
                        <Text style={styles.roleText}>Cold Storage Owner</Text>
                    </View>
                    <View style={styles.avatarCircle}>
                        <Ionicons name="business" size={20} color={Colors.primary} />
                    </View>
                </View>

                {/* Quick Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Feather name="box" size={20} color={Colors.primary} />
                        <Text style={styles.statCardValue}>{myFacilities.length}</Text>
                        <Text style={styles.statCardLabel}>Facilities</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Feather name="users" size={20} color={Colors.info} />
                        <Text style={styles.statCardValue}>{pendingBookings.length}</Text>
                        <Text style={styles.statCardLabel}>Requests</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Feather name="trending-up" size={20} color={Colors.success} />
                        <Text style={styles.statCardValue}>₹{(totalRevenue / 1000).toFixed(1)}k</Text>
                        <Text style={styles.statCardLabel}>Revenue</Text>
                    </View>
                </View>

                {/* Facilities */}
                <View style={styles.sectionHeader}>
                    <Ionicons name="business-outline" size={18} color={Colors.primary} />
                    <Text style={styles.sectionTitle}>My Facilities</Text>
                    <TouchableOpacity style={styles.addSmallBtn} onPress={() => setShowAddForm(true)}>
                        <Feather name="plus" size={14} color={Colors.primary} />
                        <Text style={styles.addSmallText}>Add</Text>
                    </TouchableOpacity>
                </View>

                {myFacilities.map((facility) => {
                    const utilization = Math.round(
                        ((facility.totalCapacity - facility.availableCapacity) / facility.totalCapacity) * 100,
                    );
                    const isEditP = editingPrice === facility.id;
                    const isEditC = editingCapacity === facility.id;

                    return (
                        <View key={facility.id} style={styles.facilityCard}>
                            <Text style={styles.facilityName}>{facility.name}</Text>
                            <View style={styles.locationRow}>
                                <Feather name="map-pin" size={13} color={Colors.textSecondary} />
                                <Text style={styles.facilityLocation}>{facility.location}</Text>
                                <View style={[styles.typeBadge, { marginLeft: "auto" as any }]}>
                                    <Text style={styles.typeBadgeText}>{facility.type?.join(", ") || "Cold"}</Text>
                                </View>
                            </View>

                            {/* Capacity Bar */}
                            <View style={styles.capacitySection}>
                                <View style={styles.capacityLabelRow}>
                                    <Text style={styles.capacityLabel}>Available: {facility.availableCapacity} kg</Text>
                                    <Text style={styles.capacityLabel}>Total: {facility.totalCapacity} kg</Text>
                                </View>
                                <View style={styles.barBg}>
                                    <View style={[styles.barFill, { width: `${utilization}%` as any }]} />
                                </View>
                                <Text style={styles.utilizationText}>{utilization}% utilized</Text>
                            </View>

                            {/* Edit Capacity */}
                            <View style={styles.editRow}>
                                <Text style={styles.editRowLabel}>Available Capacity (kg)</Text>
                                {isEditC ? (
                                    <View style={styles.editInlineRow}>
                                        <TextInput
                                            style={styles.editInput}
                                            value={editCapacityVal}
                                            onChangeText={setEditCapacityVal}
                                            keyboardType="numeric"
                                            autoFocus
                                        />
                                        <TouchableOpacity style={styles.savePill} onPress={() => saveCapacity(facility.id, facility.availableCapacity)}>
                                            <Text style={styles.savePillText}>Save</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.editPill}
                                        onPress={() => { setEditCapacityVal(facility.availableCapacity.toString()); setEditingCapacity(facility.id); }}
                                    >
                                        <Feather name="edit-2" size={12} color={Colors.primary} />
                                        <Text style={styles.editPillText}>Edit</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* Edit Price */}
                            <View style={styles.editRow}>
                                <Text style={styles.editRowLabel}>Price / kg / day</Text>
                                {isEditP ? (
                                    <View style={styles.editInlineRow}>
                                        <Text style={styles.currencyPrefix}>₹</Text>
                                        <TextInput
                                            style={styles.editInput}
                                            value={editPriceVal}
                                            onChangeText={setEditPriceVal}
                                            keyboardType="decimal-pad"
                                            autoFocus
                                        />
                                        <TouchableOpacity style={styles.savePill} onPress={() => savePrice(facility.id)}>
                                            <Text style={styles.savePillText}>Save</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View style={styles.priceDisplay}>
                                        <Text style={styles.priceDisplayText}>₹{facility.pricePerKgPerDay}/kg/day</Text>
                                        <TouchableOpacity
                                            style={styles.editPill}
                                            onPress={() => { setEditPriceVal(facility.pricePerKgPerDay.toString()); setEditingPrice(facility.id); }}
                                        >
                                            <Feather name="edit-2" size={12} color={Colors.primary} />
                                            <Text style={styles.editPillText}>Edit</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>
                    );
                })}

                {/* Incoming Booking Requests */}
                <View style={styles.sectionHeader}>
                    <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
                    <Text style={styles.sectionTitle}>Incoming Requests</Text>
                    {pendingBookings.length > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{pendingBookings.length} New</Text>
                        </View>
                    )}
                </View>

                {pendingBookings.length === 0 ? (
                    <View style={styles.emptySmall}>
                        <Feather name="inbox" size={28} color={Colors.textTertiary} />
                        <Text style={styles.emptySmallText}>No incoming requests right now.</Text>
                    </View>
                ) : (
                    pendingBookings.map((req) => (
                        <View key={req.id} style={styles.requestCard}>
                            <View style={styles.requestHeader}>
                                <View style={styles.requestAvatar}>
                                    <Text style={styles.requestAvatarText}>
                                        {req.storageType?.[0]?.toUpperCase() || "F"}
                                    </Text>
                                </View>
                                <View style={styles.requestInfo}>
                                    <Text style={styles.requestName}>Farmer Request</Text>
                                    <Text style={styles.requestMeta}>
                                        {req.storageType || "Produce"} · {req.quantity} kg · {req.duration} days
                                    </Text>
                                    <Text style={styles.requestFacility}>{req.facilityName}</Text>
                                </View>
                                <View style={styles.requestCostBadge}>
                                    <Text style={styles.requestCost}>₹{req.totalCost.toFixed(0)}</Text>
                                </View>
                            </View>

                            <View style={styles.requestActions}>
                                <TouchableOpacity
                                    style={[styles.actionBtn, styles.declineBtn]}
                                    onPress={() => updateBookingStatus(req.id, "cancelled")}
                                >
                                    <Feather name="x" size={14} color={Colors.danger} />
                                    <Text style={styles.declineBtnText}>Reject</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionBtn, styles.acceptBtn]}
                                    onPress={() => updateBookingStatus(req.id, "completed")}
                                >
                                    <Feather name="check" size={14} color="#fff" />
                                    <Text style={styles.acceptBtnText}>Accept</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}

            </ScrollView>

            {/* Add Facility Modal */}
            <AddFacilityModal
                visible={showAddForm}
                form={form}
                setForm={setForm}
                submitting={submitting}
                onSubmit={handleAddFacility}
                onClose={() => setShowAddForm(false)}
            />
        </>
    );
}

// ── Add Facility Modal ──────────────────────────────────────────────────────
function AddFacilityModal({
    visible, form, setForm, submitting, onSubmit, onClose,
}: {
    visible: boolean;
    form: any;
    setForm: (f: any) => void;
    submitting: boolean;
    onSubmit: () => void;
    onClose: () => void;
}) {
    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={modal.backdrop}>
                <ScrollView contentContainerStyle={modal.sheet}>
                    <View style={modal.handle} />
                    <View style={modal.titleRow}>
                        <Text style={modal.title}>Add Storage Facility</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Feather name="x" size={22} color={Colors.text} />
                        </TouchableOpacity>
                    </View>

                    <Text style={modal.label}>Facility Name *</Text>
                    <TextInput
                        style={modal.input}
                        placeholder="e.g. Pune Cold Storage Hub"
                        value={form.name}
                        onChangeText={(t) => setForm({ ...form, name: t })}
                    />

                    <Text style={modal.label}>Location / Address *</Text>
                    <TextInput
                        style={modal.input}
                        placeholder="e.g. Hadapsar, Pune"
                        value={form.location}
                        onChangeText={(t) => setForm({ ...form, location: t })}
                    />

                    <Text style={modal.label}>Storage Type *</Text>
                    <View style={modal.typeRow}>
                        {STORAGE_TYPES.map((t) => (
                            <TouchableOpacity
                                key={t}
                                style={[modal.typeBtn, form.type === t && modal.typeBtnActive]}
                                onPress={() => setForm({ ...form, type: t })}
                            >
                                <Text style={[modal.typeBtnText, form.type === t && modal.typeBtnTextActive]}>{t}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={modal.label}>Total Capacity (kg) *</Text>
                    <TextInput
                        style={modal.input}
                        placeholder="e.g. 50000"
                        value={form.totalCapacity}
                        onChangeText={(t) => setForm({ ...form, totalCapacity: t })}
                        keyboardType="numeric"
                    />

                    <Text style={modal.label}>Price per kg per day (₹) *</Text>
                    <TextInput
                        style={modal.input}
                        placeholder="e.g. 0.50"
                        value={form.pricePerKgPerDay}
                        onChangeText={(t) => setForm({ ...form, pricePerKgPerDay: t })}
                        keyboardType="decimal-pad"
                    />

                    <Text style={modal.label}>Contact Phone</Text>
                    <TextInput
                        style={modal.input}
                        placeholder="e.g. +91 98765 43210"
                        value={form.contactPhone}
                        onChangeText={(t) => setForm({ ...form, contactPhone: t })}
                        keyboardType="phone-pad"
                    />

                    <TouchableOpacity style={modal.submitBtn} onPress={onSubmit} disabled={submitting}>
                        {submitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Feather name="save" size={16} color="#fff" />
                                <Text style={modal.submitBtnText}>Save Facility</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </Modal>
    );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { paddingHorizontal: 16, gap: 16 },

    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
    greeting: { fontSize: 24, fontFamily: "NunitoSans_800ExtraBold", color: Colors.text },
    roleText: { fontSize: 13, fontFamily: "NunitoSans_600SemiBold", color: Colors.primary, marginTop: 2 },
    avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryLight, alignItems: "center", justifyContent: "center" },

    // Quick stats
    statsRow: { flexDirection: "row", gap: 10 },
    statCard: { flex: 1, backgroundColor: "#fff", borderRadius: 16, padding: 14, alignItems: "center", gap: 4, borderWidth: 1, borderColor: Colors.borderLight },
    statCardValue: { fontSize: 20, fontFamily: "NunitoSans_800ExtraBold", color: Colors.text },
    statCardLabel: { fontSize: 11, fontFamily: "NunitoSans_600SemiBold", color: Colors.textSecondary },

    // Sections
    sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
    sectionTitle: { fontSize: 17, fontFamily: "NunitoSans_700Bold", color: Colors.text, flex: 1 },
    addSmallBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: Colors.primaryLight, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    addSmallText: { fontSize: 13, fontFamily: "NunitoSans_700Bold", color: Colors.primary },

    // Facility Card
    facilityCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.borderLight, gap: 12 },
    facilityName: { fontSize: 18, fontFamily: "NunitoSans_700Bold", color: Colors.text },
    locationRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    facilityLocation: { fontSize: 13, fontFamily: "NunitoSans_600SemiBold", color: Colors.textSecondary, flex: 1 },
    typeBadge: { backgroundColor: Colors.infoLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    typeBadgeText: { fontSize: 11, fontFamily: "NunitoSans_700Bold", color: Colors.info },

    // Capacity
    capacitySection: { gap: 4 },
    capacityLabelRow: { flexDirection: "row", justifyContent: "space-between" },
    capacityLabel: { fontSize: 12, fontFamily: "NunitoSans_600SemiBold", color: Colors.textSecondary },
    barBg: { height: 8, backgroundColor: Colors.background, borderRadius: 4, overflow: "hidden" },
    barFill: { height: "100%", backgroundColor: Colors.primary, borderRadius: 4 },
    utilizationText: { fontSize: 11, fontFamily: "NunitoSans_600SemiBold", color: Colors.textTertiary, textAlign: "right" },

    // Inline edit rows
    editRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    editRowLabel: { fontSize: 13, fontFamily: "NunitoSans_600SemiBold", color: Colors.textSecondary },
    editInlineRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    editInput: { borderWidth: 1, borderColor: Colors.primary, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, minWidth: 70, fontSize: 14, fontFamily: "NunitoSans_700Bold", color: Colors.primary },
    currencyPrefix: { fontSize: 14, fontFamily: "NunitoSans_700Bold", color: Colors.textSecondary },
    priceDisplay: { flexDirection: "row", alignItems: "center", gap: 8 },
    priceDisplayText: { fontSize: 14, fontFamily: "NunitoSans_700Bold", color: Colors.text },
    editPill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: Colors.primaryLight, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6 },
    editPillText: { fontSize: 12, fontFamily: "NunitoSans_700Bold", color: Colors.primary },
    savePill: { backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
    savePillText: { fontSize: 12, fontFamily: "NunitoSans_700Bold", color: "#fff" },

    // Incoming Requests
    badge: { backgroundColor: Colors.dangerLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
    badgeText: { color: Colors.danger, fontSize: 12, fontFamily: "NunitoSans_700Bold" },
    emptySmall: { alignItems: "center", paddingVertical: 28, gap: 8 },
    emptySmallText: { fontSize: 14, fontFamily: "NunitoSans_600SemiBold", color: Colors.textTertiary },

    requestCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.borderLight, gap: 12 },
    requestHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
    requestAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.primaryLight, alignItems: "center", justifyContent: "center" },
    requestAvatarText: { fontSize: 16, fontFamily: "NunitoSans_800ExtraBold", color: Colors.primary },
    requestInfo: { flex: 1, gap: 2 },
    requestName: { fontSize: 15, fontFamily: "NunitoSans_700Bold", color: Colors.text },
    requestMeta: { fontSize: 13, fontFamily: "NunitoSans_600SemiBold", color: Colors.textSecondary },
    requestFacility: { fontSize: 12, fontFamily: "NunitoSans_400Regular", color: Colors.textTertiary },
    requestCostBadge: { backgroundColor: Colors.successLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    requestCost: { fontSize: 14, fontFamily: "NunitoSans_800ExtraBold", color: Colors.success },
    requestActions: { flexDirection: "row", gap: 10 },
    actionBtn: { flex: 1, flexDirection: "row", borderRadius: 10, paddingVertical: 11, alignItems: "center", justifyContent: "center", gap: 6 },
    declineBtn: { backgroundColor: Colors.dangerLight, borderWidth: 0 },
    declineBtnText: { color: Colors.danger, fontFamily: "NunitoSans_700Bold", fontSize: 14 },
    acceptBtn: { backgroundColor: Colors.primary },
    acceptBtnText: { color: "#fff", fontFamily: "NunitoSans_700Bold", fontSize: 14 },

    // Empty state (no facilities)
    emptyCard: { backgroundColor: "#fff", borderRadius: 20, padding: 32, alignItems: "center", borderWidth: 1, borderColor: Colors.borderLight, gap: 12 },
    emptyIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primaryLight, alignItems: "center", justifyContent: "center" },
    emptyTitle: { fontSize: 20, fontFamily: "NunitoSans_700Bold", color: Colors.text },
    emptySubtitle: { fontSize: 14, fontFamily: "NunitoSans_400Regular", color: Colors.textSecondary, textAlign: "center", lineHeight: 20 },
    ctaBtn: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, gap: 8, marginTop: 8 },
    ctaBtnText: { fontSize: 16, fontFamily: "NunitoSans_700Bold", color: "#fff" },
});

const modal = StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
    sheet: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48, gap: 8 },
    handle: { width: 40, height: 5, borderRadius: 3, backgroundColor: Colors.borderLight, alignSelf: "center", marginBottom: 8 },
    titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
    title: { fontSize: 20, fontFamily: "NunitoSans_800ExtraBold", color: Colors.text },
    label: { fontSize: 13, fontFamily: "NunitoSans_700Bold", color: Colors.textSecondary, marginTop: 4 },
    input: { borderWidth: 1, borderColor: Colors.borderLight, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: "NunitoSans_600SemiBold", color: Colors.text, backgroundColor: Colors.background },
    typeRow: { flexDirection: "row", gap: 8 },
    typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: Colors.borderLight, alignItems: "center", backgroundColor: Colors.background },
    typeBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    typeBtnText: { fontSize: 13, fontFamily: "NunitoSans_600SemiBold", color: Colors.textSecondary },
    typeBtnTextActive: { color: "#fff", fontFamily: "NunitoSans_700Bold" },
    submitBtn: { flexDirection: "row", backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: "center", justifyContent: "center", gap: 8, marginTop: 16 },
    submitBtnText: { fontSize: 16, fontFamily: "NunitoSans_700Bold", color: "#fff" },
});
