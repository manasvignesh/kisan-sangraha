import React, { useRef } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import Colors from "@/constants/colors";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarStrip() {
  const today = new Date();
  const scrollRef = useRef<ScrollView>(null);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 3 + i);
    return d;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.monthLabel}>
        {today.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
      </Text>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {dates.map((date, index) => {
          const isToday = date.toDateString() === today.toDateString();
          return (
            <Pressable
              key={index}
              style={[styles.dayItem, isToday && styles.dayItemActive]}
            >
              <Text style={[styles.dayName, isToday && styles.dayNameActive]}>
                {DAYS[date.getDay()]}
              </Text>
              <Text style={[styles.dayNumber, isToday && styles.dayNumberActive]}>
                {date.getDate()}
              </Text>
              {isToday && <View style={styles.activeDot} />}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  monthLabel: {
    fontSize: 13,
    fontFamily: "NunitoSans_600SemiBold",
    color: Colors.textSecondary,
    paddingHorizontal: 16,
    marginBottom: 10,
    textTransform: "uppercase" as const,
    letterSpacing: 0.8,
  },
  scrollContent: {
    paddingHorizontal: 8,
    gap: 6,
  },
  dayItem: {
    width: 44,
    height: 64,
    borderRadius: 14,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 2,
  },
  dayItemActive: {
    backgroundColor: Colors.primary,
  },
  dayName: {
    fontSize: 11,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.textTertiary,
  },
  dayNameActive: {
    color: "rgba(255,255,255,0.8)",
    fontFamily: "NunitoSans_600SemiBold",
  },
  dayNumber: {
    fontSize: 17,
    fontFamily: "NunitoSans_700Bold",
    color: Colors.text,
  },
  dayNumberActive: {
    color: "#FFFFFF",
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
    marginTop: 1,
  },
});
