import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import BookingCard from "@/components/BookingCard";
import { useApp, useTranslation } from "@/lib/context";

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const { bookings } = useApp();
  const t = useTranslation();
  const [tab, setTab] = useState<"active" | "past">("active");
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const activeBookings = bookings.filter((b) => b.status === "active");
  const pastBookings = bookings.filter((b) => b.status === "completed" || b.status === "cancelled");
  const displayedBookings = tab === "active" ? activeBookings : pastBookings;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + webTopInset + 16, paddingBottom: insets.bottom + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>{t("bookings")}</Text>

      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tabBtn, tab === "active" && styles.tabBtnActive]}
          onPress={() => setTab("active")}
        >
          <Text style={[styles.tabText, tab === "active" && styles.tabTextActive]}>
            {t("activeBookings")} ({activeBookings.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabBtn, tab === "past" && styles.tabBtnActive]}
          onPress={() => setTab("past")}
        >
          <Text style={[styles.tabText, tab === "past" && styles.tabTextActive]}>
            {t("pastBookings")} ({pastBookings.length})
          </Text>
        </Pressable>
      </View>

      {displayedBookings.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Feather name="inbox" size={32} color={Colors.textTertiary} />
          </View>
          <Text style={styles.emptyTitle}>{t("noBookings")}</Text>
          <Text style={styles.emptySubtitle}>
            {tab === "active"
              ? "Browse nearby cold storage facilities and make your first booking"
              : "Your completed bookings will appear here"}
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {displayedBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking as any} />
          ))}
        </View>
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
  },
  title: {
    fontSize: 26,
    fontFamily: "NunitoSans_800ExtraBold",
    color: Colors.text,
    marginBottom: 16,
  },
  tabRow: {
    flexDirection: "row" as const,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center" as const,
  },
  tabBtnActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontFamily: "NunitoSans_600SemiBold",
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  emptyState: {
    alignItems: "center" as const,
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.surfaceElevated,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: "NunitoSans_700Bold",
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.textTertiary,
    textAlign: "center" as const,
    lineHeight: 20,
  },
  list: {
    gap: 12,
  },
});
