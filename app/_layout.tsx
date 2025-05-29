import { Stack, useRouter, useSegments } from "expo-router";
import "./global.css";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "@/components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "@/store/auth.Store";
import { useEffect } from "react";
import * as Network from "expo-network";
import { Alert } from "react-native";
export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const { checkAuth, user, token } = useAuthStore();
  useEffect(() => {
    checkAuth();
    const checkConnection = async () => {
      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected && networkState.isInternetReachable) {
        Alert.alert("Network", "please check your network");
      }
    };

    checkConnection();
  }, []);
  useEffect(() => {
    const inAuth = segments[0] == "(auth)";
    const isSignIn = user && token;

    if (!isSignIn && !inAuth) {
      router.replace("/(auth)");
    } else if (isSignIn && inAuth) router.replace("/(tabs)");
  }, [user, token, segments]);

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
