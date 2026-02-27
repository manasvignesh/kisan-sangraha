import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { Insight } from "@/constants/data";

const SEVERITY_STYLES = {
  info: { bg: Colors.infoLight, border: "rgba(59,130,246,0.12)", iconColor: Colors.info },
  warning: { bg: Colors.warningLight, border: "rgba(245,158,11,0.12)", iconColor: Colors.warning },
  danger: { bg: Colors.dangerLight, border: "rgba(239,68,68,0.12)", iconColor: Colors.danger },
};

export default function InsightCard({ insight }: { insight: Insight }) {
  const sev = SEVERITY_STYLES[insight.severity];

  return (
    <View style={[styles.container, { backgroundColor: sev.bg, borderColor: sev.border }]}>
      <View style={[styles.iconCircle, { backgroundColor: `${sev.iconColor}18` }]}>
        <Feather name={insight.icon as any} size={18} color={sev.iconColor} />
      </View>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{insight.title}</Text>
          <View style={[styles.typeBadge, { backgroundColor: `${sev.iconColor}15` }]}>
            <Text style={[styles.typeText, { color: sev.iconColor }]}>
              {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
            </Text>
          </View>
        </View>
        <Text style={styles.message}>{insight.message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row" as const,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontFamily: "NunitoSans_700Bold",
    color: Colors.text,
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  typeText: {
    fontSize: 10,
    fontFamily: "NunitoSans_600SemiBold",
  },
  message: {
    fontSize: 13,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
