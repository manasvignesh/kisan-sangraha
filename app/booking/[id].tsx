import React, { useState, useMemo } from "react";
import { StyleSheet, Text, View, Pressable, TextInput, Platform, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import Colors from "@/constants/colors";
import { useApp } from "@/lib/context";
import { Booking } from "@/constants/data";

export default function BookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { facilities, addBooking, updateFacilityCapacity } = useApp();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const facility = facilities.find((f) => f.id === id);

  const [quantity, setQuantity] = useState("");
  const [duration, setDuration] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const quantityNum = parseInt(quantity) || 0;
  const durationNum = parseInt(duration) || 0;

  const costBreakdown = useMemo(() => {
    if (!facility || quantityNum <= 0 || durationNum <= 0)
      return { base: 0, handling: 0, insurance: 0, total: 0 };
    const base = quantityNum * facility.pricePerKgPerDay * 0.8 * durationNum;
    const handling = quantityNum * facility.pricePerKgPerDay * 0.12 * durationNum;
    const insurance = quantityNum * facility.pricePerKgPerDay * 0.08 * durationNum;
    return { base, handling, insurance, total: base + handling + insurance };
  }, [quantityNum, durationNum, facility]);

  const isValid = quantityNum > 0 && durationNum >= (facility?.minBookingDays || 1) && quantityNum <= (facility?.availableCapacity || 0);

  if (!facility) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
        <Text style={styles.errorText}>Facility not found</Text>
      </View>
    );
  }

  if (confirmed) {
    return (
      <View style={[styles.container, styles.confirmContainer, { paddingTop: insets.top + webTopInset }]}>
        <View style={styles.confirmContent}>
          <View style={styles.successCircle}>
            <Feather name="check" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.confirmTitle}>Booking Confirmed!</Text>
          <Text style={styles.confirmSub}>
            {quantityNum} kg stored at {facility.name} for {durationNum} days
          </Text>
          <View style={styles.confirmDetails}>
            <View style={styles.confirmDetailRow}>
              <Text style={styles.confirmLabel}>Total Cost</Text>
              <Text style={styles.confirmValue}>{"₹"}{costBreakdown.total.toFixed(0)}</Text>
            </View>
            <View style={styles.confirmDetailRow}>
              <Text style={styles.confirmLabel}>Start Date</Text>
              <Text style={styles.confirmValue}>
                {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </Text>
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [styles.doneBtn, pressed && { opacity: 0.9 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.replace("/(tabs)/bookings");
            }}
          >
            <Text style={styles.doneBtnText}>View My Bookings</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.homeBtn, pressed && { opacity: 0.8 }]}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.homeBtnText}>Back to Home</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const handleConfirm = () => {
    if (!isValid) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + durationNum);

    const booking: Booking = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      facilityId: facility.id,
      facilityName: facility.name,
      facilityLocation: facility.location,
      quantity: quantityNum,
      duration: durationNum,
      startDate: now.toISOString(),
      endDate: end.toISOString(),
      totalCost: costBreakdown.total,
      pricePerKgPerDay: facility.pricePerKgPerDay,
      status: "active",
      storageType: facility.type.join(", "),
    };

    addBooking(booking);
    updateFacilityCapacity(facility.id, quantityNum);
    setConfirmed(true);
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollViewCompat
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + webTopInset + 16, paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
        bottomOffset={60}
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={Colors.text} />
        </Pressable>

        <Text style={styles.pageTitle}>Book Storage</Text>

        <View style={styles.facilityInfo}>
          <MaterialCommunityIcons name="snowflake" size={20} color={Colors.primary} />
          <View style={styles.facilityInfoContent}>
            <Text style={styles.facilityName}>{facility.name}</Text>
            <Text style={styles.facilityLocation}>{facility.location}</Text>
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Quantity (kg)</Text>
          <View style={styles.inputRow}>
            <Feather name="package" size={18} color={Colors.textTertiary} />
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
              placeholder="Enter quantity in kg"
              placeholderTextColor={Colors.textTertiary}
            />
          </View>
          <Text style={styles.inputHint}>
            Available: {(facility.availableCapacity).toLocaleString()} kg
          </Text>
          {quantityNum > facility.availableCapacity && (
            <Text style={styles.inputError}>Exceeds available capacity</Text>
          )}
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Duration (days)</Text>
          <View style={styles.inputRow}>
            <Feather name="calendar" size={18} color={Colors.textTertiary} />
            <TextInput
              style={styles.input}
              value={duration}
              onChangeText={setDuration}
              keyboardType="number-pad"
              placeholder={`Min. ${facility.minBookingDays} days`}
              placeholderTextColor={Colors.textTertiary}
            />
          </View>
          {durationNum > 0 && durationNum < facility.minBookingDays && (
            <Text style={styles.inputError}>Minimum {facility.minBookingDays} days required</Text>
          )}
        </View>

        {quantityNum > 0 && durationNum > 0 && (
          <View style={styles.costCard}>
            <Text style={styles.costTitle}>Cost Breakdown</Text>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Base storage ({quantityNum}kg x {durationNum}d)</Text>
              <Text style={styles.costValue}>{"₹"}{costBreakdown.base.toFixed(0)}</Text>
            </View>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Handling charges</Text>
              <Text style={styles.costValue}>{"₹"}{costBreakdown.handling.toFixed(0)}</Text>
            </View>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Insurance</Text>
              <Text style={styles.costValue}>{"₹"}{costBreakdown.insurance.toFixed(0)}</Text>
            </View>
            <View style={styles.costSep} />
            <View style={styles.costRow}>
              <Text style={styles.costTotalLabel}>Total Cost</Text>
              <Text style={styles.costTotalValue}>{"₹"}{costBreakdown.total.toFixed(0)}</Text>
            </View>
          </View>
        )}
      </KeyboardAwareScrollViewCompat>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, Platform.OS === "web" ? 34 : 16) }]}>
        {costBreakdown.total > 0 && (
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{"₹"}{costBreakdown.total.toFixed(0)}</Text>
          </View>
        )}
        <Pressable
          style={({ pressed }) => [
            styles.confirmBtn,
            !isValid && styles.confirmBtnDisabled,
            pressed && isValid && { opacity: 0.9 },
          ]}
          onPress={handleConfirm}
          disabled={!isValid}
        >
          <Text style={styles.confirmBtnText}>Confirm Booking</Text>
          <Feather name="check" size={18} color="#FFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  confirmContainer: {
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  content: {
    paddingHorizontal: 16,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    fontFamily: "NunitoSans_600SemiBold",
    color: Colors.textSecondary,
    textAlign: "center" as const,
    marginTop: 100,
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
  pageTitle: {
    fontSize: 26,
    fontFamily: "NunitoSans_800ExtraBold",
    color: Colors.text,
  },
  facilityInfo: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  facilityInfoContent: {
    flex: 1,
  },
  facilityName: {
    fontSize: 16,
    fontFamily: "NunitoSans_700Bold",
    color: Colors.text,
  },
  facilityLocation: {
    fontSize: 13,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.textTertiary,
    marginTop: 2,
  },
  inputSection: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: "NunitoSans_600SemiBold",
    color: Colors.text,
  },
  inputRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "NunitoSans_600SemiBold",
    color: Colors.text,
  },
  inputHint: {
    fontSize: 12,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.textTertiary,
    paddingLeft: 4,
  },
  inputError: {
    fontSize: 12,
    fontFamily: "NunitoSans_600SemiBold",
    color: Colors.danger,
    paddingLeft: 4,
  },
  costCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  costTitle: {
    fontSize: 16,
    fontFamily: "NunitoSans_700Bold",
    color: Colors.text,
    marginBottom: 14,
  },
  costRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 6,
  },
  costLabel: {
    fontSize: 13,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.textSecondary,
  },
  costValue: {
    fontSize: 13,
    fontFamily: "NunitoSans_600SemiBold",
    color: Colors.text,
  },
  costSep: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 6,
  },
  costTotalLabel: {
    fontSize: 15,
    fontFamily: "NunitoSans_700Bold",
    color: Colors.text,
  },
  costTotalValue: {
    fontSize: 18,
    fontFamily: "NunitoSans_800ExtraBold",
    color: Colors.primary,
  },
  bottomBar: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  totalSection: {
    flexDirection: "row" as const,
    alignItems: "baseline" as const,
    gap: 4,
  },
  totalLabel: {
    fontSize: 13,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.textTertiary,
  },
  totalValue: {
    fontSize: 22,
    fontFamily: "NunitoSans_800ExtraBold",
    color: Colors.text,
  },
  confirmBtn: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  confirmBtnDisabled: {
    backgroundColor: Colors.textTertiary,
    opacity: 0.5,
  },
  confirmBtnText: {
    fontSize: 16,
    fontFamily: "NunitoSans_700Bold",
    color: "#FFFFFF",
  },
  confirmContent: {
    alignItems: "center" as const,
    paddingHorizontal: 32,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.success,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 20,
  },
  confirmTitle: {
    fontSize: 24,
    fontFamily: "NunitoSans_800ExtraBold",
    color: Colors.text,
    marginBottom: 8,
  },
  confirmSub: {
    fontSize: 14,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.textSecondary,
    textAlign: "center" as const,
    marginBottom: 24,
    lineHeight: 20,
  },
  confirmDetails: {
    width: "100%" as any,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    gap: 10,
  },
  confirmDetailRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
  },
  confirmLabel: {
    fontSize: 14,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.textSecondary,
  },
  confirmValue: {
    fontSize: 15,
    fontFamily: "NunitoSans_700Bold",
    color: Colors.text,
  },
  doneBtn: {
    width: "100%" as any,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  doneBtnText: {
    fontSize: 16,
    fontFamily: "NunitoSans_700Bold",
    color: "#FFFFFF",
  },
  homeBtn: {
    width: "100%" as any,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center" as const,
    backgroundColor: Colors.surfaceElevated,
  },
  homeBtnText: {
    fontSize: 15,
    fontFamily: "NunitoSans_600SemiBold",
    color: Colors.textSecondary,
  },
});
