import React from "react";
import { StyleSheet, Text, View, ScrollView, Pressable, Platform } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useApp } from "@/lib/context";

const TYPE_ICONS: Record<string, string> = {
  Cold: "snowflake",
  Frozen: "cube-outline",
  Dairy: "cow",
};

function getAvailabilityColor(available: number, total: number) {
  const pct = available / total;
  if (pct > 0.5) return Colors.availabilityHigh;
  if (pct > 0.2) return Colors.availabilityMedium;
  return Colors.availabilityLow;
}

export default function StorageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { facilities } = useApp();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const facility = facilities.find((f) => f.id === id);
  if (!facility) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
        <Text style={styles.errorText}>Facility not found</Text>
      </View>
    );
  }

  const availColor = getAvailabilityColor(facility.availableCapacity, facility.totalCapacity);
  const pct = Math.round((facility.availableCapacity / facility.totalCapacity) * 100);
  const usedPct = 100 - pct;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + webTopInset + 16, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={Colors.text} />
        </Pressable>

        <View style={styles.headerCard}>
          <View style={styles.nameRow}>
            <Text style={styles.facilityName}>{facility.name}</Text>
            {facility.verified && (
              <View style={styles.verifiedBadge}>
                <Feather name="shield" size={12} color={Colors.verified} />
                <Text style={styles.verifiedText}>Govt Verified</Text>
              </View>
            )}
          </View>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={13} color={Colors.textTertiary} />
            <Text style={styles.locationText}>{facility.location}</Text>
            <Text style={styles.distanceText}>{facility.distance} km away</Text>
          </View>

          <View style={styles.ratingRow}>
            <Feather name="star" size={16} color={Colors.warning} />
            <Text style={styles.ratingValue}>{facility.rating}</Text>
            <Text style={styles.ratingCount}>({facility.reviewCount} reviews)</Text>
          </View>

          <View style={styles.typesRow}>
            {facility.type.map((t) => (
              <View key={t} style={styles.typeBadge}>
                <MaterialCommunityIcons name={TYPE_ICONS[t] as any} size={14} color={Colors.primary} />
                <Text style={styles.typeText}>{t} Storage</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Capacity Utilization</Text>
          <View style={styles.capacityBarLarge}>
            <View style={[styles.capacityFillLarge, { width: `${pct}%` as any, backgroundColor: availColor }]} />
          </View>
          <View style={styles.capacityLabels}>
            <Text style={styles.capacityLabelLeft}>
              {(facility.availableCapacity / 1000).toFixed(1)}T available
            </Text>
            <Text style={styles.capacityLabelRight}>
              {usedPct}% utilized
            </Text>
          </View>
          <View style={styles.capacityStats}>
            <View style={styles.capacityStat}>
              <Text style={styles.capacityStatValue}>{(facility.totalCapacity / 1000).toFixed(0)}T</Text>
              <Text style={styles.capacityStatLabel}>Total</Text>
            </View>
            <View style={styles.capacityStat}>
              <Text style={[styles.capacityStatValue, { color: availColor }]}>
                {(facility.availableCapacity / 1000).toFixed(1)}T
              </Text>
              <Text style={styles.capacityStatLabel}>Available</Text>
            </View>
            <View style={styles.capacityStat}>
              <Text style={styles.capacityStatValue}>
                {((facility.totalCapacity - facility.availableCapacity) / 1000).toFixed(1)}T
              </Text>
              <Text style={styles.capacityStatLabel}>Occupied</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Transparent Pricing</Text>
          <View style={styles.priceRow}>
            <View style={styles.priceMain}>
              <Text style={styles.priceValue}>{"₹"}{facility.pricePerKgPerDay.toFixed(2)}</Text>
              <Text style={styles.priceUnit}>per kg / day</Text>
            </View>
          </View>
          <View style={styles.priceBreakdown}>
            <View style={styles.priceItem}>
              <Text style={styles.priceItemLabel}>Base rate</Text>
              <Text style={styles.priceItemValue}>{"₹"}{(facility.pricePerKgPerDay * 0.8).toFixed(2)}/kg/day</Text>
            </View>
            <View style={styles.priceSep} />
            <View style={styles.priceItem}>
              <Text style={styles.priceItemLabel}>Handling charges</Text>
              <Text style={styles.priceItemValue}>{"₹"}{(facility.pricePerKgPerDay * 0.12).toFixed(2)}/kg/day</Text>
            </View>
            <View style={styles.priceSep} />
            <View style={styles.priceItem}>
              <Text style={styles.priceItemLabel}>Insurance</Text>
              <Text style={styles.priceItemValue}>{"₹"}{(facility.pricePerKgPerDay * 0.08).toFixed(2)}/kg/day</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          <View style={styles.certList}>
            {facility.certifications.map((cert) => (
              <View key={cert} style={styles.certItem}>
                <Feather name="check-circle" size={14} color={Colors.success} />
                <Text style={styles.certText}>{cert}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {facility.amenities.map((a) => (
              <View key={a} style={styles.amenityBadge}>
                <Feather name="check" size={12} color={Colors.primary} />
                <Text style={styles.amenityText}>{a}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <Feather name="cpu" size={16} color={Colors.primary} />
            <Text style={styles.aiTitle}>AI Recommendation</Text>
          </View>
          <Text style={styles.aiMessage}>
            High temperature forecast this week. Storing produce for 3-5 days is recommended
            to avoid spoilage losses. Current market trend shows prices rising - optimal selling
            window is in 4-6 days.
          </Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Feather name="clock" size={14} color={Colors.textTertiary} />
            <Text style={styles.infoText}>{facility.operatingHours}</Text>
          </View>
          <View style={styles.infoItem}>
            <Feather name="phone" size={14} color={Colors.textTertiary} />
            <Text style={styles.infoText}>{facility.contactPhone}</Text>
          </View>
          <View style={styles.infoItem}>
            <Feather name="calendar" size={14} color={Colors.textTertiary} />
            <Text style={styles.infoText}>Min. {facility.minBookingDays} day booking</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, Platform.OS === "web" ? 34 : 16) }]}>
        <View style={styles.bottomPrice}>
          <Text style={styles.bottomPriceLabel}>From</Text>
          <Text style={styles.bottomPriceValue}>{"₹"}{facility.pricePerKgPerDay.toFixed(2)}</Text>
          <Text style={styles.bottomPriceUnit}>/kg/day</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.bookButton, pressed && { opacity: 0.9 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push({ pathname: "/booking/[id]", params: { id: facility.id } });
          }}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
          <Feather name="arrow-right" size={18} color="#FFF" />
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
  content: {
    paddingHorizontal: 16,
    gap: 14,
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
    marginBottom: 4,
  },
  headerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  nameRow: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    justifyContent: "space-between" as const,
    marginBottom: 8,
  },
  facilityName: {
    fontSize: 22,
    fontFamily: "NunitoSans_800ExtraBold",
    color: Colors.text,
    flex: 1,
  },
  verifiedBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    backgroundColor: Colors.verifiedLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginLeft: 8,
  },
  verifiedText: {
    fontSize: 11,
    fontFamily: "NunitoSans_600SemiBold",
    color: Colors.verified,
  },
  locationRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 13,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.textSecondary,
    flex: 1,
  },
  distanceText: {
    fontSize: 12,
    fontFamily: "NunitoSans_600SemiBold",
    color: Colors.primary,
  },
  ratingRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    marginBottom: 12,
  },
  ratingValue: {
    fontSize: 16,
    fontFamily: "NunitoSans_700Bold",
    color: Colors.text,
  },
  ratingCount: {
    fontSize: 13,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.textTertiary,
  },
  typesRow: {
    flexDirection: "row" as const,
    gap: 8,
  },
  typeBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 5,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 12,
    fontFamily: "NunitoSans_600SemiBold",
    color: Colors.primary,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "NunitoSans_700Bold",
    color: Colors.text,
    marginBottom: 14,
  },
  capacityBarLarge: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    overflow: "hidden" as const,
    marginBottom: 8,
  },
  capacityFillLarge: {
    height: "100%" as const,
    borderRadius: 4,
  },
  capacityLabels: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: 14,
  },
  capacityLabelLeft: {
    fontSize: 12,
    fontFamily: "NunitoSans_600SemiBold",
    color: Colors.textSecondary,
  },
  capacityLabelRight: {
    fontSize: 12,
    fontFamily: "NunitoSans_600SemiBold",
    color: Colors.textSecondary,
  },
  capacityStats: {
    flexDirection: "row" as const,
    gap: 10,
  },
  capacityStat: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center" as const,
  },
  capacityStatValue: {
    fontSize: 16,
    fontFamily: "NunitoSans_700Bold",
    color: Colors.text,
  },
  capacityStatLabel: {
    fontSize: 11,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.textTertiary,
    marginTop: 2,
  },
  priceRow: {
    marginBottom: 14,
  },
  priceMain: {
    flexDirection: "row" as const,
    alignItems: "baseline" as const,
    gap: 6,
  },
  priceValue: {
    fontSize: 28,
    fontFamily: "NunitoSans_800ExtraBold",
    color: Colors.primary,
  },
  priceUnit: {
    fontSize: 14,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.textSecondary,
  },
  priceBreakdown: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    padding: 14,
  },
  priceItem: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 6,
  },
  priceItemLabel: {
    fontSize: 13,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.textSecondary,
  },
  priceItemValue: {
    fontSize: 13,
    fontFamily: "NunitoSans_600SemiBold",
    color: Colors.text,
  },
  priceSep: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  certList: {
    gap: 10,
  },
  certItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  certText: {
    fontSize: 14,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.text,
  },
  amenitiesGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
  },
  amenityBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  amenityText: {
    fontSize: 12,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.textSecondary,
  },
  aiCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(27, 107, 58, 0.15)",
  },
  aiHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 8,
  },
  aiTitle: {
    fontSize: 14,
    fontFamily: "NunitoSans_700Bold",
    color: Colors.primary,
  },
  aiMessage: {
    fontSize: 13,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.text,
    lineHeight: 20,
  },
  infoRow: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  infoItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.textSecondary,
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
  bottomPrice: {
    flexDirection: "row" as const,
    alignItems: "baseline" as const,
    gap: 2,
  },
  bottomPriceLabel: {
    fontSize: 12,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.textTertiary,
  },
  bottomPriceValue: {
    fontSize: 22,
    fontFamily: "NunitoSans_800ExtraBold",
    color: Colors.text,
  },
  bottomPriceUnit: {
    fontSize: 12,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.textTertiary,
  },
  bookButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  bookButtonText: {
    fontSize: 16,
    fontFamily: "NunitoSans_700Bold",
    color: "#FFFFFF",
  },
});
