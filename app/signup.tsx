import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";
import { useApp } from "@/lib/context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

export default function Signup() {
    const router = useRouter();
    const { register } = useApp();

    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    // Selected role locally before completing signup
    const [selectedRole, setSelectedRole] = useState<"farmer" | "provider">("farmer");

    const handleSignup = async () => {
        try {
            await register({ username: identifier, password, role: selectedRole });
            router.replace("/");
        } catch (error: any) {
            alert(error.message || "Signup failed");
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
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join Kisan Sangraha</Text>
                </View>

                <View style={styles.formStructure}>

                    <Text style={styles.label}>I am a...</Text>
                    <View style={styles.roleContainer}>
                        <TouchableOpacity
                            style={[styles.roleButton, selectedRole === "farmer" && styles.roleButtonActive]}
                            onPress={() => setSelectedRole("farmer")}
                        >
                            <Ionicons name="leaf-outline" size={24} color={selectedRole === "farmer" ? Colors.light.tint : Colors.light.icon} />
                            <Text style={[styles.roleText, selectedRole === "farmer" && styles.roleTextActive]}>Farmer</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.roleButton, selectedRole === "provider" && styles.roleButtonActive]}
                            onPress={() => setSelectedRole("provider")}
                        >
                            <Ionicons name="business-outline" size={24} color={selectedRole === "provider" ? Colors.light.tint : Colors.light.icon} />
                            <Text style={[styles.roleText, selectedRole === "provider" && styles.roleTextActive]}>Cold Storage Owner</Text>
                        </TouchableOpacity>
                    </View>

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

                    <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
                        <Text style={styles.signupButtonText}>Sign Up</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => router.push("/login")}>
                        <Text style={styles.loginText}>Login</Text>
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
    label: {
        fontFamily: "NunitoSans_700Bold",
        fontSize: 16,
        color: Colors.light.text,
        marginBottom: 4,
    },
    roleContainer: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 16,
    },
    roleButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        gap: 8,
    },
    roleButtonActive: {
        borderColor: Colors.light.tint,
        backgroundColor: Colors.light.tint + "10", // 10% opacity tail
    },
    roleText: {
        fontFamily: "NunitoSans_600SemiBold",
        fontSize: 14,
        color: Colors.light.textMuted,
    },
    roleTextActive: {
        color: Colors.light.tint,
        fontFamily: "NunitoSans_700Bold",
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
    signupButton: {
        backgroundColor: Colors.light.tint,
        borderRadius: 12,
        height: 56,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 16,
        shadowColor: Colors.light.tint,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    signupButtonText: {
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
    loginText: {
        fontFamily: "NunitoSans_700Bold",
        fontSize: 14,
        color: Colors.light.tint,
    },
});
