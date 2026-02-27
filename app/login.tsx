import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";
import { useApp } from "@/lib/context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

export default function Login() {
    const router = useRouter();
    const { login } = useApp();

    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            await login({ username: identifier, password });
            router.replace("/");
        } catch (error: any) {
            alert(error.message || "Login failed");
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <StatusBar style="dark" />
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <View style={styles.header}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Login to Kisan Sangraha</Text>
                </View>

                <View style={styles.formStructure}>
                    <View style={styles.inputContainer}>
                        <Ionicons name="call-outline" size={20} color={Colors.light.icon} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Mobile Number / Email"
                            value={identifier}
                            onChangeText={setIdentifier}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color={Colors.light.icon} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity style={styles.forgotPassword}>
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                        <Text style={styles.loginButtonText}>Login</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => router.push("/signup")}>
                        <Text style={styles.signupText}>Sign Up</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 24,
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontFamily: "NunitoSans_800ExtraBold",
        fontSize: 28,
        color: Colors.light.text,
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: "NunitoSans_400Regular",
        fontSize: 16,
        color: Colors.light.textMuted,
    },
    formStructure: {
        gap: 16,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: Colors.borderLight,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontFamily: "NunitoSans_600SemiBold",
        fontSize: 16,
        color: Colors.light.text,
    },
    forgotPassword: {
        alignSelf: "flex-end",
    },
    forgotPasswordText: {
        fontFamily: "NunitoSans_600SemiBold",
        fontSize: 14,
        color: Colors.light.tint,
    },
    loginButton: {
        backgroundColor: Colors.light.tint,
        borderRadius: 12,
        height: 56,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 8,
        shadowColor: Colors.light.tint,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    loginButtonText: {
        fontFamily: "NunitoSans_700Bold",
        fontSize: 16,
        color: "#fff",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 32,
    },
    footerText: {
        fontFamily: "NunitoSans_400Regular",
        fontSize: 14,
        color: Colors.light.textMuted,
    },
    signupText: {
        fontFamily: "NunitoSans_700Bold",
        fontSize: 14,
        color: Colors.light.tint,
    },
});
