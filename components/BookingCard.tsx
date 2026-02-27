import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { Booking } from "@/constants/data";

const STATUS_CONFIG = {
  active: { color: Colors.success, bg: Colors.successLight, label: "Active", icon: "clock" },
  completed: { color: Colors.info, bg: Colors.infoLight, label: "Completed", icon: "check-circle" },
  cancelled: { color: Colors.danger, bg: Colors.dangerLight, label: "Cancelled", icon: "x-circle" },
};

export default function BookingCard({ booking }: { booking: Booking }) {
  const statusConf = STATUS_CONFIG[booking.status];

  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);
  const now = new Date();
  const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.nameSection}>
          <MaterialCommunityIcons name="snowflake" size={18} color={Colors.primary} />
          <View>
            <Text style={styles.facilityName} numberOfLines={1}>{booking.facilityName}</Text>
            <Text style={styles.location}>{booking.facilityLocation}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusConf.bg }]}>
          <Feather name={statusConf.icon as any} size={11} color={statusConf.color} />
          <Text style={[styles.statusText, { color: statusConf.color }]}>{statusConf.label}</Text>
        </View>
      </View>

      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Quantity</Text>
          <Text style={styles.detailValue}>{booking.quantity} kg</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Duration</Text>
          <Text style={styles.detailValue}>{booking.duration} days</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Total Cost</Text>
          <Text style={styles.detailValue}>{"₹"}{booking.totalCost.toFixed(0)}</Text>
        </View>
        {booking.status === "active" && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Remaining</Text>
            <Text style={[styles.detailValue, { color: daysRemaining <= 2 ? Colors.danger : Colors.primary }]}>
              {daysRemaining}d
            </Text>
          </View>
        )}
      </View>

      <View style={styles.dateRow}>
        <Feather name="calendar" size={12} color={Colors.textTertiary} />
        <Text style={styles.dateText}>
          {startDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          {" - "}
          {endDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  topRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
    marginBottom: 14,
  },
  nameSection: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    flex: 1,
  },
  facilityName: {
    fontSize: 15,
    fontFamily: "NunitoSans_700Bold",
    color: Colors.text,
  },
  location: {
    fontSize: 12,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.textTertiary,
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "NunitoSans_600SemiBold",
  },
  detailsGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
    marginBottom: 12,
  },
  detailItem: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 70,
  },
  detailLabel: {
    fontSize: 10,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.textTertiary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: "NunitoSans_700Bold",
    color: Colors.text,
  },
  dateRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.textTertiary,
  },
});
