import { Stack, useRouter, useSegments } from "expo-router";
import "./global.css";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "@/components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "@/store/auth.Store";
import { useEffect, useState } from "react";
import * as Network from "expo-network";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const { checkAuth, user, token } = useAuthStore();
  useEffect(() => {
    const checkConnection = async () => {
      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected || !networkState.isInternetReachable) {
        Alert.alert("Network", "Please check your internet connection.");
      }
    };

    checkConnection();
  }, []);

  useEffect(() => {
    checkAuth();
    const inAuth = segments[0] == "(auth)";
    const isSignIn = user && token;

    if (!isSignIn && !inAuth) {
      router.replace("/(auth)");
    } else if (isSignIn && inAuth) router.replace("/(tabs)");
  }, [user, token]);

  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
        </Stack>
      </SafeScreen>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
