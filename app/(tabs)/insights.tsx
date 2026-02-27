import React from "react";
import { StyleSheet, Text, View, ScrollView, Platform, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import InsightCard from "@/components/InsightCard";
import { useTranslation } from "@/lib/context";
import { useQuery } from "@tanstack/react-query";
import type { InsightType } from "@shared/schema";

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const t = useTranslation();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const { data: insights = [], isLoading } = useQuery<InsightType[]>({
    queryKey: ["/api/insights"],
    queryFn: async () => {
      const res = await fetch("/api/insights");
      if (!res.ok) throw new Error("Failed to fetch insights");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  const weatherInsights = insights.filter((i) => i.type === "weather");
  const marketInsights = insights.filter((i) => i.type === "market");
  const demandInsights = insights.filter((i) => i.type === "demand");

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + webTopInset + 16, paddingBottom: insets.bottom + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>{t("insights")}</Text>
      <Text style={styles.subtitle}>AI-powered advisory for better decisions</Text>

      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: Colors.dangerLight }]}>
          <Feather name="alert-triangle" size={18} color={Colors.danger} />
          <Text style={styles.summaryCount}>{weatherInsights.length}</Text>
          <Text style={styles.summaryLabel}>Weather Alerts</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: Colors.infoLight }]}>
          <Feather name="trending-up" size={18} color={Colors.info} />
          <Text style={styles.summaryCount}>{marketInsights.length}</Text>
          <Text style={styles.summaryLabel}>Market Trends</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: Colors.warningLight }]}>
          <Feather name="activity" size={18} color={Colors.warning} />
          <Text style={styles.summaryCount}>{demandInsights.length}</Text>
          <Text style={styles.summaryLabel}>Demand Alerts</Text>
        </View>
      </View>

      {weatherInsights.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Feather name="cloud-lightning" size={16} color={Colors.danger} />
            <Text style={styles.sectionTitle}>Weather & Risk Alerts</Text>
          </View>
          <View style={styles.cardList}>
            {weatherInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </View>
        </>
      )}

      {marketInsights.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Feather name="bar-chart-2" size={16} color={Colors.info} />
            <Text style={styles.sectionTitle}>Market Price Trends</Text>
          </View>
          <View style={styles.cardList}>
            {marketInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </View>
        </>
      )}

      {demandInsights.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Feather name="trending-up" size={16} color={Colors.warning} />
            <Text style={styles.sectionTitle}>Storage Demand</Text>
          </View>
          <View style={styles.cardList}>
            {demandInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </View>
        </>
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
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row" as const,
    gap: 10,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    alignItems: "center" as const,
    gap: 6,
  },
  summaryCount: {
    fontSize: 22,
    fontFamily: "NunitoSans_800ExtraBold",
    color: Colors.text,
  },
  summaryLabel: {
    fontSize: 10,
    fontFamily: "NunitoSans_600SemiBold",
    color: Colors.textSecondary,
    textAlign: "center" as const,
  },
  sectionHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "NunitoSans_700Bold",
    color: Colors.text,
  },
  cardList: {
    gap: 10,
    marginBottom: 24,
  },
});
