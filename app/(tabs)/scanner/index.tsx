import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import React, { useState, useRef } from "react";
import { Button, Text, TouchableOpacity, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function QRScanner() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState<string | null>("");
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View className="flex justify-center items-center bg-[#1a1a1a] h-full">
        <Text className="text-white text-center">
          We need your permission to access the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setScannedData(data);
    router.push({ pathname: "/frams/imageDownload", params: { scannedData } });
  };

  return (
    <View className="flex-1">
      <CameraView
        ref={cameraRef}
        className="flex-1 justify-between"
        facing={facing}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scannedData ? undefined : handleBarcodeScanned}
      >
        <View className="flex-row justify-between p-5 mt-10">
          <TouchableOpacity
            className="bg-black/50 rounded-full p-2.5"
            onPress={toggleCameraFacing}
          >
            <Ionicons name="camera-reverse" size={32} color="white" />
          </TouchableOpacity>
        </View>
        <View className="h-full flex justify-center items-center -mt-20 ">
          <View className="w-[250px] h-[250px] self-center border-2 border-white/50 relative">
            <View className="absolute top-[-2px] left-[-2px] w-[50px] h-[50px] border-l-4 border-t-4 border-white" />
            <View className="absolute top-[-2px] right-[-2px] w-[50px] h-[50px] border-r-4 border-t-4 border-white" />
            <View className="absolute bottom-[-2px] left-[-2px] w-[50px] h-[50px] border-l-4 border-b-4 border-white" />
            <View className="absolute bottom-[-2px] right-[-2px] w-[50px] h-[50px] border-r-4 border-b-4 border-white" />
          </View>
        </View>
      </CameraView>
    </View>
  );
}
