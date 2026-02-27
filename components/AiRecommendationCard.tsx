/**
 * AiRecommendationCard
 *
 * Fetches AI-powered storage advice from POST /api/ai/recommend.
 * Uses NVIDIA NIM (KImik2.5 / configured AI_MODEL) when API key is set.
 * Falls back to rule-based advice automatically if:
 *  - API key is missing
 *  - Network request fails
 *  - Response latency exceeds 8 seconds
 * Never renders empty – always shows something meaningful.
 */
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { getApiUrl, apiFetch } from "@/lib/query-client";

interface Props {
    temperature?: number;
    humidity?: number;
    cropType?: string;
    quantity?: number;
}

type Status = "loading" | "ai" | "fallback" | "error";

// ── Rule-based deterministic fallback ────────────────────────────────────────
function getRuleBasedRecommendation(temperature: number, humidity: number, cropType: string): string {
    if (temperature > 35) {
        return `⚠️ Critical heat (${temperature}°C) — ${cropType || "produce"} will spoil within 12–24 hours. Book cold storage immediately at ₹0.40–0.55/kg/day.`;
    }
    if (temperature > 30) {
        return `High temperature (${temperature}°C) — refrigerated storage recommended within 48 hours to preserve ${cropType || "produce"} quality.`;
    }
    if (humidity > 75) {
        return `High humidity (${humidity}%) — grain and pulses risk mould. Airtight cold storage strongly recommended.`;
    }
    if (temperature > 24) {
        return `Moderate conditions (${temperature}°C, ${humidity}% humidity) — plan cold storage within 2–3 days for optimal freshness.`;
    }
    return `Good conditions (${temperature}°C) — standard ventilated storage is sufficient. Book early for better rates.`;
}

export default function AiRecommendationCard({ temperature = 30, humidity = 55, cropType = "produce", quantity }: Props) {
    const [recommendation, setRecommendation] = useState<string>("");
    const [status, setStatus] = useState<Status>("loading");

    useEffect(() => {
        let cancelled = false;

        const fetchRecommendation = async () => {
            setStatus("loading");

            // 8-second timeout — if AI takes longer, use fallback
            const timeoutId = setTimeout(() => {
                if (!cancelled && status === "loading") {
                    console.warn("[AI] Request timeout — using rule-based fallback");
                    setRecommendation(getRuleBasedRecommendation(temperature, humidity, cropType));
                    setStatus("fallback");
                }
            }, 8000);

            try {
                console.log("[AI] Sending recommendation request", { temperature, humidity, cropType, quantity });

                const res = await apiFetch(new URL("/api/ai/recommend", getApiUrl()).toString(), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ temperature, humidity, cropType, quantity }),
                    credentials: "include",
                });

                clearTimeout(timeoutId);
                if (cancelled) return;

                if (!res.ok) {
                    console.error("[AI] API error:", res.status);
                    throw new Error(`Status ${res.status}`);
                }

                const data = await res.json();

                if (data.recommendation) {
                    console.log(`[AI] Got ${data.source === "ai" ? "NVIDIA NIM" : "rule-based"} recommendation`);
                    setRecommendation(data.recommendation);
                    setStatus(data.source === "ai" ? "ai" : "fallback");
                } else {
                    throw new Error("Empty response");
                }
            } catch (err) {
                clearTimeout(timeoutId);
                if (cancelled) return;
                console.error("[AI] Request failed — rule-based fallback activated:", err);
                setRecommendation(getRuleBasedRecommendation(temperature, humidity, cropType));
                setStatus("fallback");
            }
        };

        fetchRecommendation();
        return () => { cancelled = true; };
    }, [temperature, humidity, cropType, quantity]);

    const isAi = status === "ai";
    const isLoading = status === "loading";

    return (
        <View style={[styles.card, isAi && styles.cardAi]}>
            {/* Header */}
            <View style={styles.headerRow}>
                <View style={styles.iconWrap}>
                    <Feather name={isAi ? "cpu" : "zap"} size={16} color={isAi ? Colors.verified : Colors.primary} />
                </View>
                <Text style={styles.title}>AI Storage Advisory</Text>
                <View style={[styles.sourceBadge, isAi ? styles.sourceBadgeAi : styles.sourceBadgeFallback]}>
                    <Text style={[styles.sourceBadgeText, isAi ? styles.sourceBadgeTextAi : styles.sourceBadgeTextFallback]}>
                        {isLoading ? "..." : isAi ? "KImik2.5" : "Smart Advice"}
                    </Text>
                </View>
            </View>

            {/* Body */}
            {isLoading ? (
                <View style={styles.loadingRow}>
                    <ActivityIndicator size="small" color={Colors.primary} />
                    <Text style={styles.loadingText}>Generating storage advice...</Text>
                </View>
            ) : (
                <Text style={styles.body}>{recommendation}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.primaryLight,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.primary + "30",
        gap: 10,
    },
    cardAi: {
        backgroundColor: Colors.verifiedLight,
        borderColor: Colors.verified + "30",
    },
    headerRow: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        gap: 8,
    },
    iconWrap: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: "#fff",
        alignItems: "center" as const,
        justifyContent: "center" as const,
    },
    title: {
        fontSize: 14,
        fontFamily: "NunitoSans_700Bold",
        color: Colors.text,
        flex: 1,
    },
    sourceBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    sourceBadgeFallback: {
        backgroundColor: Colors.primaryLight,
        borderWidth: 1,
        borderColor: Colors.primary + "40",
    },
    sourceBadgeAi: {
        backgroundColor: Colors.verifiedLight,
        borderWidth: 1,
        borderColor: Colors.verified + "40",
    },
    sourceBadgeText: {
        fontSize: 11,
        fontFamily: "NunitoSans_700Bold",
    },
    sourceBadgeTextFallback: {
        color: Colors.primary,
    },
    sourceBadgeTextAi: {
        color: Colors.verified,
    },
    loadingRow: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        gap: 8,
        paddingVertical: 4,
    },
    loadingText: {
        fontSize: 13,
        fontFamily: "NunitoSans_400Regular",
        color: Colors.textSecondary,
    },
    body: {
        fontSize: 14,
        fontFamily: "NunitoSans_400Regular",
        color: Colors.text,
        lineHeight: 20,
    },
});
