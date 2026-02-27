import React from "react";
import { StyleSheet, Text, View, ScrollView, Pressable, Platform, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useApp, useTranslation } from "@/lib/context";

const LANGUAGES = [
  { code: "en" as const, label: "English", native: "English" },
  { code: "hi" as const, label: "Hindi", native: "हिन्दी" },
  { code: "te" as const, label: "Telugu", native: "తెలుగు" },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { userProfile, language, setLanguage, bookings, role, setRole } = useApp();
  const t = useTranslation();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const activeBookings = bookings.filter((b) => b.status === "active");
  const totalQuantity = activeBookings.reduce((sum, b) => sum + b.quantity, 0);
  const totalSaved = bookings.reduce((sum, b) => sum + b.totalCost * 0.15, 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + webTopInset + 16, paddingBottom: insets.bottom + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.profileCard}>
        <View style={styles.avatarLarge}>
          <Feather name="user" size={32} color={Colors.primary} />
        </View>
        <Text style={styles.userName}>{userProfile.name}</Text>
        <View style={styles.profileLocation}>
          <Feather name="map-pin" size={13} color={Colors.textTertiary} />
          <Text style={styles.profileLocationText}>{userProfile.location}</Text>
        </View>
        <View style={styles.roleBadge}>
          <MaterialCommunityIcons
            name={role === "farmer" ? "sprout" : "warehouse"}
            size={14}
            color={Colors.primary}
          />
          <Text style={styles.roleText}>
            {role === "farmer" ? "Farmer" : "Storage Provider"}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>{t("bookingSummary")}</Text>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Feather name="package" size={20} color={Colors.primary} />
          <Text style={styles.statValue}>{bookings.length}</Text>
          <Text style={styles.statLabel}>{t("totalBookings")}</Text>
        </View>
        <View style={styles.statCard}>
          <Feather name="database" size={20} color={Colors.info} />
          <Text style={styles.statValue}>{totalQuantity > 0 ? `${totalQuantity}kg` : "0"}</Text>
          <Text style={styles.statLabel}>{t("activeStorage")}</Text>
        </View>
        <View style={styles.statCard}>
          <Feather name="trending-down" size={20} color={Colors.success} />
          <Text style={styles.statValue}>
            {"₹"}{totalSaved > 0 ? totalSaved.toFixed(0) : "0"}
          </Text>
          <Text style={styles.statLabel}>{t("totalSaved")}</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>{t("language")}</Text>
      <View style={styles.languageRow}>
        {LANGUAGES.map((lang) => (
          <Pressable
            key={lang.code}
            style={[
              styles.languageBtn,
              language === lang.code && styles.languageBtnActive,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setLanguage(lang.code);
            }}
          >
            <Text
              style={[
                styles.languageBtnText,
                language === lang.code && styles.languageBtnTextActive,
              ]}
            >
              {lang.native}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionLabel}>{t("settings")}</Text>
      <View style={styles.settingsCard}>
        {/* Only farmers can switch to Provider mode — Providers are always in provider mode */}
        {role === "farmer" && (
          <Pressable
            style={styles.settingsItem}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const newRole = role === "farmer" ? "provider" : "farmer";
              setRole(newRole as any);
              if (newRole === "provider") {
                router.push("/provider");
              }
            }}
          >
            <View style={styles.settingsItemLeft}>
              <View style={[styles.settingsIcon, { backgroundColor: Colors.verifiedLight }]}>
                <MaterialCommunityIcons name="swap-horizontal" size={18} color={Colors.verified} />
              </View>
              <View>
                <Text style={styles.settingsItemTitle}>Switch to Provider</Text>
                <Text style={styles.settingsItemSub}>Manage your cold storage facility</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color={Colors.textTertiary} />
          </Pressable>
        )}
        {role === "farmer" && <View style={styles.settingsSep} />}


        <Pressable style={styles.settingsItem}>
          <View style={styles.settingsItemLeft}>
            <View style={[styles.settingsIcon, { backgroundColor: Colors.infoLight }]}>
              <Feather name="bell" size={16} color={Colors.info} />
            </View>
            <View>
              <Text style={styles.settingsItemTitle}>Notifications</Text>
              <Text style={styles.settingsItemSub}>Manage alert preferences</Text>
            </View>
          </View>
          <Feather name="chevron-right" size={18} color={Colors.textTertiary} />
        </Pressable>

        <View style={styles.settingsSep} />

        <Pressable style={styles.settingsItem}>
          <View style={styles.settingsItemLeft}>
            <View style={[styles.settingsIcon, { backgroundColor: Colors.successLight }]}>
              <Feather name="help-circle" size={16} color={Colors.success} />
            </View>
            <View>
              <Text style={styles.settingsItemTitle}>Help & Support</Text>
              <Text style={styles.settingsItemSub}>FAQs and contact</Text>
            </View>
          </View>
          <Feather name="chevron-right" size={18} color={Colors.textTertiary} />
        </Pressable>
      </View>
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
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: "center" as const,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryLight,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderWidth: 3,
    borderColor: Colors.primary,
    marginBottom: 12,
  },
  userName: {
    fontSize: 22,
    fontFamily: "NunitoSans_800ExtraBold",
    color: Colors.text,
  },
  profileLocation: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    marginTop: 4,
  },
  profileLocationText: {
    fontSize: 13,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.textSecondary,
  },
  roleBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 10,
  },
  roleText: {
    fontSize: 13,
    fontFamily: "NunitoSans_600SemiBold",
    color: Colors.primary,
  },
  sectionLabel: {
    fontSize: 16,
    fontFamily: "NunitoSans_700Bold",
    color: Colors.text,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row" as const,
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: "center" as const,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  statValue: {
    fontSize: 18,
    fontFamily: "NunitoSans_800ExtraBold",
    color: Colors.text,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.textTertiary,
    textAlign: "center" as const,
  },
  languageRow: {
    flexDirection: "row" as const,
    gap: 10,
    marginBottom: 24,
  },
  languageBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center" as const,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  languageBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  languageBtnText: {
    fontSize: 14,
    fontFamily: "NunitoSans_600SemiBold",
    color: Colors.textSecondary,
  },
  languageBtnTextActive: {
    color: "#FFFFFF",
  },
  settingsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: "hidden" as const,
    marginBottom: 24,
  },
  settingsItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    padding: 16,
  },
  settingsItemLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    flex: 1,
  },
  settingsIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  settingsItemTitle: {
    fontSize: 14,
    fontFamily: "NunitoSans_600SemiBold",
    color: Colors.text,
  },
  settingsItemSub: {
    fontSize: 12,
    fontFamily: "NunitoSans_400Regular",
    color: Colors.textTertiary,
    marginTop: 1,
  },
  settingsSep: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: 16,
  },
});
