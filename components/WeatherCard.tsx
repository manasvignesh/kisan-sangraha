import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { MOCK_WEATHER } from "@/constants/data";

export default function WeatherCard() {
  const weather = MOCK_WEATHER;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.tempSection}>
          <Feather name="sun" size={22} color={Colors.warning} />
          <Text style={styles.temp}>{weather.temperature}°C</Text>
          <View style={styles.conditionBadge}>
            <Text style={styles.conditionText}>{weather.condition}</Text>
          </View>
        </View>
        <View style={styles.humidityBadge}>
          <Feather name="droplet" size={13} color={Colors.frostDark} />
          <Text style={styles.humidityText}>{weather.humidity}%</Text>
        </View>
      </View>
      <View style={styles.suggestionRow}>
        <Feather name="alert-triangle" size={14} color={Colors.warning} />
        <Text style={styles.suggestion}>{weather.suggestion}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.warningLight,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.15)",
  },
  topRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  tempSection: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  temp: {
    fontSize: 24,
    fontFamily: "NunitoSans_800ExtraBold",
    color: Colors.text,
  },
  conditionBadge: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  conditionText: {
    fontSize: 11,
    fontFamily: "NunitoSans_600SemiBold",
    color: Colors.warning,
  },
  humidityBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    backgroundColor: Colors.frost,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  humidityText: {
    fontSize: 12,
    fontFamily: "NunitoSans_600SemiBold",
    color: Colors.frostDark,
  },
  suggestionRow: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: 8,
    backgroundColor: "rgba(245, 158, 11, 0.08)",
    padding: 10,
    borderRadius: 10,
  },
  suggestion: {
    fontSize: 13,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.text,
    flex: 1,
    lineHeight: 18,
  },
});
