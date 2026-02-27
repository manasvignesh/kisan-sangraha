import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useQuery } from "@tanstack/react-query";
import { getApiUrl, apiFetch } from "@/lib/query-client";
import { useApp } from "@/lib/context";


interface Props {
  selectedDate?: Date;
}

export default function WeatherCard({ selectedDate }: Props) {
  const { userLocation } = useApp();
  const today = new Date();
  const isToday = !selectedDate || selectedDate.toDateString() === today.toDateString();

  const { data: weather, isLoading } = useQuery({
    queryKey: ["/api/weather", userLocation?.lat, userLocation?.lon, selectedDate?.toDateString()],
    queryFn: async () => {
      const url = new URL("/api/weather", getApiUrl());
      if (userLocation?.lat) {
        url.searchParams.set("lat", userLocation.lat.toString());
        url.searchParams.set("lon", userLocation.lon.toString());
      }
      if (!isToday && selectedDate) {
        url.searchParams.set("date", selectedDate.toISOString().split("T")[0]);
      }
      const res = await apiFetch(url.toString(), { credentials: "include" });
      if (!res.ok) return { temperature: 33, condition: "Warm", humidity: 45, suggestion: "Moderate conditions — consider cold storage for perishables." };
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading || !weather) {
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator size="small" color={Colors.warning} />
      </View>
    );
  }

  const icon = weather.temperature > 33 ? "sun" : weather.condition?.toLowerCase().includes("rain") ? "cloud-rain" : "cloud";

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.tempSection}>
          <Feather name={icon as any} size={22} color={Colors.warning} />
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
