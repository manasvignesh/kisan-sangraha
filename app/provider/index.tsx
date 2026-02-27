import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable, TextInput, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import Colors from "@/constants/colors";
import { useApp, useTranslation } from "@/lib/context";

const MOCK_REQUESTS = [
  { id: "r1", farmer: "Suresh Patil", quantity: 500, duration: 7, status: "pending" as const, date: "Today" },
  { id: "r2", farmer: "Meena Devi", quantity: 1200, duration: 14, status: "pending" as const, date: "Today" },
  { id: "r3", farmer: "Anil Kumar", quantity: 300, duration: 5, status: "accepted" as const, date: "Yesterday" },
];

export default function ProviderDashboard() {
  const insets = useSafeAreaInsets();
  const t = useTranslation();
  const { facilities, setFacilityAvailability } = useApp();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const facility = facilities[0];
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [editCapacity, setEditCapacity] = useState(false);
  const [newCapacity, setNewCapacity] = useState(facility ? String(facility.availableCapacity) : "0");

  const totalRequested = requests.filter((r) => r.status === "pending").reduce((s, r) => s + r.quantity, 0);
  const usedPct = facility ? Math.round(((facility.totalCapacity - facility.availableCapacity) / facility.totalCapacity) * 100) : 0;

  return (
    <KeyboardAwareScrollViewCompat
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + webTopInset + 16, paddingBottom: insets.bottom + 40 },
      ]}
      showsVerticalScrollIndicator={false}
      bottomOffset={20}
    >
      <View style={styles.headerRow}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>{t("providerDashboard")}</Text>
      </View>

      {facility && (
        <>
          <View style={styles.facilityHeader}>
            <MaterialCommunityIcons name="warehouse" size={24} color={Colors.primary} />
            <View style={styles.facilityHeaderContent}>
              <Text style={styles.facilityName}>{facility.name}</Text>
              <Text style={styles.facilityLocation}>{facility.location}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: Colors.primaryLight }]}>
              <Text style={styles.statValue}>{(facility.totalCapacity / 1000).toFixed(0)}T</Text>
              <Text style={styles.statLabel}>Total Capacity</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: Colors.successLight }]}>
              <Text style={styles.statValue}>{(facility.availableCapacity / 1000).toFixed(1)}T</Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: Colors.warningLight }]}>
              <Text style={styles.statValue}>{usedPct}%</Text>
              <Text style={styles.statLabel}>Utilized</Text>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Update Availability</Text>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setEditCapacity(!editCapacity);
                }}
              >
                <Feather name={editCapacity ? "x" : "edit-2"} size={18} color={Colors.primary} />
              </Pressable>
            </View>
            {editCapacity ? (
              <View style={styles.editRow}>
                <TextInput
                  style={styles.editInput}
                  value={newCapacity}
                  onChangeText={setNewCapacity}
                  keyboardType="number-pad"
                  placeholder="Available capacity (kg)"
                  placeholderTextColor={Colors.textTertiary}
                />
                <Pressable
                  style={styles.saveBtn}
                  onPress={() => {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    const newCap = parseInt(newCapacity) || 0;
                    if (newCap > 0 && newCap <= facility.totalCapacity) {
                      setFacilityAvailability(facility.id, newCap);
                    }
                    setEditCapacity(false);
                  }}
                >
                  <Feather name="check" size={18} color="#FFF" />
                </Pressable>
              </View>
            ) : (
              <View style={styles.capacityDisplay}>
                <View style={styles.capacityBarLarge}>
                  <View
                    style={[
                      styles.capacityFill,
                      { width: `${100 - usedPct}%` as any, backgroundColor: Colors.success },
                    ]}
                  />
                </View>
                <Text style={styles.capacityText}>
                  {(facility.availableCapacity / 1000).toFixed(1)}T of {(facility.totalCapacity / 1000).toFixed(0)}T available
                </Text>
              </View>
            )}
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Booking Requests</Text>
              <View style={styles.requestCountBadge}>
                <Text style={styles.requestCountText}>
                  {requests.filter((r) => r.status === "pending").length} pending
                </Text>
              </View>
            </View>
            <View style={styles.requestList}>
              {requests.map((req) => (
                <View key={req.id} style={styles.requestItem}>
                  <View style={styles.requestInfo}>
                    <Text style={styles.requestFarmer}>{req.farmer}</Text>
                    <Text style={styles.requestDetail}>
                      {req.quantity} kg for {req.duration} days
                    </Text>
                    <Text style={styles.requestDate}>{req.date}</Text>
                  </View>
                  {req.status === "pending" ? (
                    <View style={styles.requestActions}>
                      <Pressable
                        style={styles.acceptBtn}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setRequests((prev) =>
                            prev.map((r) => (r.id === req.id ? { ...r, status: "accepted" as const } : r))
                          );
                        }}
                      >
                        <Feather name="check" size={16} color="#FFF" />
                      </Pressable>
                      <Pressable
                        style={styles.declineBtn}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setRequests((prev) => prev.filter((r) => r.id !== req.id));
                        }}
                      >
                        <Feather name="x" size={16} color={Colors.danger} />
                      </Pressable>
                    </View>
                  ) : (
                    <View style={styles.acceptedBadge}>
                      <Feather name="check-circle" size={12} color={Colors.success} />
                      <Text style={styles.acceptedText}>Accepted</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Facility Details</Text>
            <View style={styles.detailsList}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Storage Types</Text>
                <Text style={styles.detailValue}>{facility.type.join(", ")}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Price per kg/day</Text>
                <Text style={styles.detailValue}>{"₹"}{facility.pricePerKgPerDay.toFixed(2)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Operating Hours</Text>
                <Text style={styles.detailValue}>{facility.operatingHours}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Certifications</Text>
                <Text style={styles.detailValue}>{facility.certifications.join(", ")}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Rating</Text>
                <Text style={styles.detailValue}>{facility.rating} ({facility.reviewCount} reviews)</Text>
              </View>
            </View>
          </View>

          <View style={styles.analyticsCard}>
            <Text style={styles.sectionTitle}>Capacity Analytics</Text>
            <View style={styles.analyticsRow}>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsValue}>{totalRequested}kg</Text>
                <Text style={styles.analyticsLabel}>Pending Requests</Text>
              </View>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsValue}>{"₹"}{(facility.pricePerKgPerDay * (facility.totalCapacity - facility.availableCapacity) * 30).toFixed(0)}</Text>
                <Text style={styles.analyticsLabel}>Est. Monthly Revenue</Text>
              </View>
            </View>
          </View>
        </>
      )}
    </KeyboardAwareScrollViewCompat>
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
    alignItems: "center" as const,
    gap: 12,
    marginBottom: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  title: {
    fontSize: 22,
    fontFamily: "NunitoSans_800ExtraBold",
    color: Colors.text,
  },
  facilityHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    backgroundColor: Colors.primaryLight,
    padding: 16,
    borderRadius: 14,
  },
  facilityHeaderContent: {
    flex: 1,
  },
  facilityName: {
    fontSize: 17,
    fontFamily: "NunitoSans_700Bold",
    color: Colors.primary,
  },
  facilityLocation: {
    fontSize: 13,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row" as const,
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    alignItems: "center" as const,
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontFamily: "NunitoSans_800ExtraBold",
    color: Colors.text,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.textSecondary,
    textAlign: "center" as const,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  sectionRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "NunitoSans_700Bold",
    color: Colors.text,
  },
  editRow: {
    flexDirection: "row" as const,
    gap: 10,
  },
  editInput: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    fontFamily: "NunitoSans_600SemiBold",
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  capacityDisplay: {
    gap: 8,
  },
  capacityBarLarge: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    overflow: "hidden" as const,
  },
  capacityFill: {
    height: "100%" as const,
    borderRadius: 4,
  },
  capacityText: {
    fontSize: 13,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.textSecondary,
  },
  requestCountBadge: {
    backgroundColor: Colors.warningLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  requestCountText: {
    fontSize: 11,
    fontFamily: "NunitoSans_600SemiBold",
    color: Colors.warning,
  },
  requestList: {
    gap: 10,
  },
  requestItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.surfaceElevated,
    padding: 12,
    borderRadius: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestFarmer: {
    fontSize: 14,
    fontFamily: "NunitoSans_600SemiBold",
    color: Colors.text,
  },
  requestDetail: {
    fontSize: 12,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.textSecondary,
    marginTop: 2,
  },
  requestDate: {
    fontSize: 11,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.textTertiary,
    marginTop: 2,
  },
  requestActions: {
    flexDirection: "row" as const,
    gap: 8,
  },
  acceptBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.success,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  declineBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.dangerLight,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  acceptedBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    backgroundColor: Colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  acceptedText: {
    fontSize: 11,
    fontFamily: "NunitoSans_600SemiBold",
    color: Colors.success,
  },
  detailsList: {
    gap: 10,
    marginTop: 10,
  },
  detailRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: 13,
    fontFamily: "NunitoSans_600SemiBold",
    color: Colors.text,
    flex: 1,
    textAlign: "right" as const,
  },
  analyticsCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(27,107,58,0.12)",
  },
  analyticsRow: {
    flexDirection: "row" as const,
    gap: 12,
    marginTop: 14,
  },
  analyticsItem: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.7)",
    padding: 14,
    borderRadius: 12,
    alignItems: "center" as const,
  },
  analyticsValue: {
    fontSize: 18,
    fontFamily: "NunitoSans_800ExtraBold",
    color: Colors.primary,
  },
  analyticsLabel: {
    fontSize: 11,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: "center" as const,
  },
});
