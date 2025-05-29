import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function _layout() {
  const inset = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#f1f1f1",

        tabBarShowLabel: false,
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: "#f3d08c",
          borderTopWidth: 1,
          borderTopColor: "#010101",
          paddingTop: 5,
          height: 60 + inset.bottom,
          paddingBottom: inset.bottom,
        },
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={"#000000"} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="scanner/index"
        options={{
          title: "Scanner",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="scan" size={size} color={"#000000"} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={"#000000"} />
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
