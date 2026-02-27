import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { StorageFacility } from "@/constants/data";

function getAvailabilityColor(available: number, total: number) {
  const pct = available / total;
  if (pct > 0.5) return Colors.availabilityHigh;
  if (pct > 0.2) return Colors.availabilityMedium;
  return Colors.availabilityLow;
}

function getAvailabilityLabel(available: number, total: number) {
  const pct = available / total;
  if (pct > 0.5) return "High";
  if (pct > 0.2) return "Medium";
  return "Low";
}

const TYPE_ICONS: Record<string, string> = {
  Cold: "snowflake",
  Frozen: "cube-outline",
  Dairy: "cow",
};

export default function StorageCard({ facility }: { facility: StorageFacility }) {
  const availColor = getAvailabilityColor(facility.availableCapacity, facility.totalCapacity);
  const availLabel = getAvailabilityLabel(facility.availableCapacity, facility.totalCapacity);
  const pct = Math.round((facility.availableCapacity / facility.totalCapacity) * 100);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: "/storage/[id]", params: { id: facility.id } });
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={handlePress}
    >
      <View style={styles.header}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{facility.name}</Text>
          {facility.verified && (
            <View style={styles.verifiedBadge}>
              <Feather name="check-circle" size={11} color={Colors.verified} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>
        <View style={styles.locationRow}>
          <Feather name="map-pin" size={12} color={Colors.textTertiary} />
          <Text style={styles.locationText}>{facility.location}</Text>
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>{facility.distance} km</Text>
          </View>
        </View>
      </View>

      <View style={styles.typesRow}>
        {facility.type.map((t) => (
          <View key={t} style={styles.typeBadge}>
            <MaterialCommunityIcons
              name={TYPE_ICONS[t] as any}
              size={13}
              color={Colors.primary}
            />
            <Text style={styles.typeText}>{t}</Text>
          </View>
        ))}
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={styles.infoValue}>
            {"₹"}{facility.pricePerKgPerDay.toFixed(2)}
          </Text>
          <Text style={styles.infoLabel}>per kg/day</Text>
        </View>
        <View style={styles.infoSep} />
        <View style={styles.infoItem}>
          <View style={[styles.availDot, { backgroundColor: availColor }]} />
          <Text style={[styles.infoValue, { color: availColor }]}>{availLabel}</Text>
          <Text style={styles.infoLabel}>{pct}% free</Text>
        </View>
        <View style={styles.infoSep} />
        <View style={styles.infoItem}>
          <Feather name="star" size={13} color={Colors.warning} />
          <Text style={styles.infoValue}>{facility.rating}</Text>
          <Text style={styles.infoLabel}>({facility.reviewCount})</Text>
        </View>
      </View>

      <View style={styles.capacityBar}>
        <View
          style={[
            styles.capacityFill,
            {
              width: `${pct}%` as any,
              backgroundColor: availColor,
            },
          ]}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.capacityText}>
          {(facility.availableCapacity / 1000).toFixed(0)}T / {(facility.totalCapacity / 1000).toFixed(0)}T available
        </Text>
        <View style={styles.bookBtn}>
          <Text style={styles.bookBtnText}>View & Book</Text>
          <Feather name="arrow-right" size={14} color="#FFF" />
        </View>
      </View>
    </Pressable>
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
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
  },
  header: {
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontFamily: "NunitoSans_700Bold",
    color: Colors.text,
    flex: 1,
  },
  verifiedBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 3,
    backgroundColor: Colors.verifiedLight,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 10,
    fontFamily: "NunitoSans_600SemiBold",
    color: Colors.verified,
  },
  locationRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.textTertiary,
    flex: 1,
  },
  distanceBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  distanceText: {
    fontSize: 11,
    fontFamily: "NunitoSans_600SemiBold",
    color: Colors.primary,
  },
  typesRow: {
    flexDirection: "row" as const,
    gap: 6,
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 11,
    fontFamily: "NunitoSans_600SemiBold",
    color: Colors.primary,
  },
  infoRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-around" as const,
    marginBottom: 12,
    backgroundColor: Colors.surfaceElevated,
    padding: 10,
    borderRadius: 10,
  },
  infoItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  infoSep: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: "NunitoSans_700Bold",
    color: Colors.text,
  },
  infoLabel: {
    fontSize: 11,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.textTertiary,
  },
  availDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  capacityBar: {
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    marginBottom: 12,
    overflow: "hidden" as const,
  },
  capacityFill: {
    height: "100%" as const,
    borderRadius: 2,
  },
  footer: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  capacityText: {
    fontSize: 12,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.textSecondary,
  },
  bookBtn: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  bookBtnText: {
    fontSize: 13,
    fontFamily: "NunitoSans_700Bold",
    color: "#FFFFFF",
  },
});
