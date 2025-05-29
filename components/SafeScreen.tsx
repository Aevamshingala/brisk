import { View } from "react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SafeScreen({ children }: any) {
  const inset = useSafeAreaInsets();
  return <View style={{ paddingTop: inset.top, flex: 1 }}>{children}</View>;
}
