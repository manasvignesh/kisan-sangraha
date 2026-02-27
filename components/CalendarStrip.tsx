import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import Colors from "@/constants/colors";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Props {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export default function CalendarStrip({ selectedDate, onDateSelect }: Props) {
  const today = new Date();

  // Show 14 days: 3 before today + today + 10 ahead
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 3 + i);
    return d;
  });

  const isSameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  const isToday = (d: Date) => isSameDay(d, today);
  const isSelected = (d: Date) => isSameDay(d, selectedDate);
  const isFuture = (d: Date) => d > today;

  return (
    <View style={styles.container}>
      {/* Month + selected date header */}
      <View style={styles.headerRow}>
        <Text style={styles.monthLabel}>
          {selectedDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        </Text>
        <Text style={styles.selectedLabel}>
          {isToday(selectedDate)
            ? "Today"
            : selectedDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {dates.map((date, index) => {
          const selected = isSelected(date);
          const todayDate = isToday(date);
          const future = isFuture(date);

          return (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.dayItem,
                selected && styles.dayItemSelected,
                todayDate && !selected && styles.dayItemToday,
                pressed && !selected && styles.dayItemPressed,
              ]}
              onPress={() => onDateSelect(date)}
              accessibilityRole="button"
              accessibilityLabel={date.toDateString()}
            >
              <Text
                style={[
                  styles.dayName,
                  selected && styles.dayNameSelected,
                  todayDate && !selected && styles.dayNameToday,
                  future && !selected && styles.dayNameFuture,
                ]}
              >
                {DAYS[date.getDay()]}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  selected && styles.dayNumberSelected,
                  todayDate && !selected && styles.dayNumberToday,
                  future && !selected && styles.dayNumberFuture,
                ]}
              >
                {date.getDate()}
              </Text>
              {selected && <View style={styles.activeDot} />}
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
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  headerRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  monthLabel: {
    fontSize: 13,
    fontFamily: "NunitoSans_600SemiBold",
    color: Colors.textSecondary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.8,
  },
  selectedLabel: {
    fontSize: 12,
    fontFamily: "NunitoSans_700Bold",
    color: Colors.primary,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  scrollContent: {
    paddingHorizontal: 8,
    gap: 4,
  },
  dayItem: {
    width: 44,
    height: 66,
    borderRadius: 14,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 2,
  },
  dayItemSelected: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  dayItemToday: {
    backgroundColor: Colors.primaryLight,
  },
  dayItemPressed: {
    backgroundColor: Colors.borderLight,
    transform: [{ scale: 0.95 }],
  },
  dayName: {
    fontSize: 11,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.textTertiary,
  },
  dayNameSelected: {
    color: "rgba(255,255,255,0.85)",
    fontFamily: "NunitoSans_600SemiBold",
  },
  dayNameToday: {
    color: Colors.primary,
    fontFamily: "NunitoSans_600SemiBold",
  },
  dayNameFuture: {
    color: Colors.textTertiary,
  },
  dayNumber: {
    fontSize: 17,
    fontFamily: "NunitoSans_700Bold",
    color: Colors.text,
  },
  dayNumberSelected: {
    color: "#FFFFFF",
    fontFamily: "NunitoSans_800ExtraBold",
  },
  dayNumberToday: {
    color: Colors.primary,
  },
  dayNumberFuture: {
    color: Colors.textSecondary,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.7)",
    marginTop: 1,
  },
});
