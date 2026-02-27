import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useFonts, NunitoSans_400Regular, NunitoSans_600SemiBold, NunitoSans_700Bold, NunitoSans_800ExtraBold } from "@expo-google-fonts/nunito-sans";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { AppProvider, useApp } from "@/lib/context";

SplashScreen.preventAutoHideAsync();

import { Platform, StyleSheet, View } from "react-native";
import Colors from "@/constants/colors";

function RootLayoutNav() {
  const { isAuthenticated } = useApp();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === "login" || segments[0] === "signup";

    setTimeout(() => {
      if (!isAuthenticated && !inAuthGroup) {
        router.replace("/login");
      } else if (isAuthenticated && inAuthGroup) {
        router.replace("/");
      }
    }, 0);
  }, [isAuthenticated, segments]);

  const isWeb = Platform.OS === "web";

  return (
    <View style={[styles.rootContainer, isWeb && styles.webContainer]}>
      <View style={[styles.appWrapper, isWeb && styles.webWrapper]}>
        <Stack screenOptions={{ headerBackTitle: "Back", headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false, animation: "fade" }} />
          <Stack.Screen name="signup" options={{ headerShown: false, animation: "fade" }} />
          <Stack.Screen name="storage/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="booking/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="provider/index" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        </Stack>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  webContainer: {
    alignItems: "center",
    backgroundColor: "#F2F4F2", // Slightly darker external background for contrast
  },
  appWrapper: {
    flex: 1,
    width: "100%",
    backgroundColor: Colors.background,
  },
  webWrapper: {
    maxWidth: 480, // Typical max width for simulated mobile
    height: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    overflow: "hidden",
  },
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    NunitoSans_400Regular,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
    NunitoSans_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView>
          <KeyboardProvider>
            <AppProvider>
              <RootLayoutNav />
            </AppProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
