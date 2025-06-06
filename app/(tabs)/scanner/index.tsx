import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import React, { useState, useRef, useEffect } from "react";
import { Alert, Button, Text, TouchableOpacity, View } from "react-native";

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
        {/* <Button onPress={requestPermission} title="Grant Permission" /> */}
        <View className="flex justify-center items-center mt-10">
          <TouchableOpacity onPress={requestPermission}>
            <Text className="bg-[#f5bb4a] w-56 h-12 rounded-full text-center align-middle text-[#0a0a0a] text-xl">
              Grant Permission
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    router.push({
      pathname: "/frams/imageDownload",
      params: { scannedData: data },
    });
    setScannedData(null);
  };

  return (
    <CameraView
      ref={cameraRef}
      className="flex-1 justify-between"
      facing={facing}
      barcodeScannerSettings={{
        barcodeTypes: ["qr", "pdf417"],
      }}
      onBarcodeScanned={scannedData ? undefined : handleBarcodeScanned}
    >
      {/* Camera controls */}
      <View className="flex-row justify-between p-5 mt-10">
        <TouchableOpacity
          className="bg-black/50 rounded-full p-2.5"
          onPress={toggleCameraFacing}
        >
          <Ionicons name="camera-reverse" size={32} color="white" />
        </TouchableOpacity>
      </View>

      {/* Scanner frame overlay */}
      <View className="h-full flex justify-center items-center -mt-20">
        <View className="w-[250px] h-[250px] self-center border-2 border-white/50 relative">
          {/* Corner indicators */}
          <View className="absolute top-[-2px] left-[-2px] w-[50px] h-[50px] border-l-4 border-t-4 border-white" />
          <View className="absolute top-[-2px] right-[-2px] w-[50px] h-[50px] border-r-4 border-t-4 border-white" />
          <View className="absolute bottom-[-2px] left-[-2px] w-[50px] h-[50px] border-l-4 border-b-4 border-white" />
          <View className="absolute bottom-[-2px] right-[-2px] w-[50px] h-[50px] border-r-4 border-b-4 border-white" />
        </View>
      </View>

      {/* Scan status indicator */}
      {scannedData && (
        <View className="absolute bottom-10 self-center bg-green-500 px-4 py-2 rounded-full">
          <Text className="text-white">QR Code Detected!</Text>
        </View>
      )}
    </CameraView>
  );
}
