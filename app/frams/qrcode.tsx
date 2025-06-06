import React, { useEffect, useRef, useState } from "react";
import {
  View,
  TextInput,
  Alert,
  Text,
  TouchableOpacity,
  Keyboard,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { baseUrl } from "../../store/url.js";
import QRCode from "react-native-qrcode-svg";
import { captureRef } from "react-native-view-shot";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
import { router, useLocalSearchParams } from "expo-router";
import { useAuthStore } from "@/store/auth.Store";

export default function QRGenerator() {
  const [qrValue, setQrValue] = useState<any>("");
  const [userName, setUserName] = useState("The one");
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [complit, setComplit] = useState(false);
  const qrRef = useRef(null);
  const [isLoding, setIsLoding] = useState(false);
  const { token } = useAuthStore();
  const { imageId } = useLocalSearchParams<any>();
  const { user } = useAuthStore();
  useEffect(() => {
    setQrValue(imageId);
  }, [complit]);
  useEffect(() => {
    setUserName(user.userName);
  }, []);

  const handleGenerate = () => {
    if (title.trim() !== "" || message.trim() !== "") {
      setTitle(title);
      setMessage(message);
      Keyboard.dismiss();

      setComplit(true);
    } else {
      setComplit(false);
      Alert.alert("details", "please fill detail correctly");
    }
  };

  const handleSave = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please allow access to your photos to save QR codes."
        );
        return;
      }

      const uri = await captureRef(qrRef, {
        format: "png",
        quality: 0.7,
      });
      const asset = await MediaLibrary.createAssetAsync(uri);
      const formData = new FormData();

      formData.append("title", title);
      formData.append("message", message);
      formData.append("imageid", imageId);

      formData.append("qrCodeImage", {
        uri: uri, // file://...
        name: "qr.png",
        type: "image/png",
      } as any);

      const response = await fetch(`${baseUrl}/api/v1/qr/createqr`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (response.status != 200) {
        Alert.alert("fail", "somthing went wrong");
      } else {
        Alert.alert("Success", "QR code saved");

        setIsLoding(false);
        const album = await MediaLibrary.getAlbumAsync("Brisk Qr");

        if (album === null) {
          await MediaLibrary.createAlbumAsync("Brisk Qr", asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }
        router.push("/(tabs)");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoding(false);
    }
  };

  const handleShare = async () => {
    try {
      const uri = await captureRef(qrRef, {
        format: "png",
        quality: 1,
      });

      const fileUri = FileSystem.documentDirectory + "qr_share.png";
      await FileSystem.copyAsync({
        from: uri,
        to: fileUri,
      });

      await Sharing.shareAsync(fileUri, {
        dialogTitle: "Share your QR Code",
        UTI: "image/png",
        mimeType: "image/png",
      });

      // Clean up
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    } catch (error) {
      Alert.alert("Error", "Could not share QR code.");
      console.error(error);
    }
  };

  return (
    <ScrollView className="bg-[#1a1a1a]">
      <View className="bg-[#1a1a1a] w-full h-full p-2">
        {/* Header */}
        <View className="flex-row justify-between items-center m-5">
          <TouchableOpacity className="ml-4">
            <Ionicons
              name="information-circle-outline"
              size={25}
              color="#f5bb4a"
            />
          </TouchableOpacity>

          <View className="flex-1 items-center">
            <Text className="text-white text-3xl">Brisk</Text>
          </View>

          {complit && (
            <TouchableOpacity className="mr-4" onPress={handleShare}>
              <Feather name="share" size={25} color="#f5bb4a" />
            </TouchableOpacity>
          )}
        </View>

        {/* QR Input Section */}
        <View className="px-5 mt-5">
          <TextInput
            className="bg-[#303130] text-white p-4 rounded-xl mb-3"
            placeholder="Enter a text"
            placeholderTextColor="#aaa"
            value={title}
            onChangeText={setTitle}
            onSubmitEditing={handleGenerate}
          />
          <TextInput
            className="bg-[#303130] text-white p-4 rounded-xl mb-3"
            placeholder="Enter a message"
            placeholderTextColor="#aaa"
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={handleGenerate}
          />
          <TouchableOpacity
            className="bg-[#f5bb4a] p-4 rounded-xl items-center"
            onPress={handleGenerate}
          >
            <Text className="text-black font-bold">Generate QR Code</Text>
          </TouchableOpacity>
        </View>

        {/* QR Code Display */}
        {complit && (
          <View
            className="flex-1 items-center bg-[#1a1a1a] mt-5"
            collapsable={false}
          >
            <View className="flex-1 items-center">
              <View className="mt-48 w-96">
                <View className="bg-[#303130] h-64 p-5 rounded-3xl border-b-2 border-dashed">
                  <Text className="text-white top-40 text-center text-3xl">
                    {title}
                  </Text>
                </View>
                <View className="bg-[#303130] h-40 p-5 rounded-3xl border-dashed border-t-2">
                  <Text className="text-center text-2xl text-white">
                    Show and Download the incredible Photo's by the
                  </Text>
                  <Text className="text-[#f5bb4a] text-3xl text-center mt-2">
                    {userName}
                  </Text>
                </View>
              </View>

              <View className="absolute top-10" ref={qrRef} collapsable={false}>
                <View className="w-fit p-8 h-fit bg-white rounded-3xl shadow-lg">
                  <QRCode value={qrValue} size={200} />
                </View>
              </View>
            </View>
            {/* Save Button */}
            <TouchableOpacity
              className="bg-[#f5bb4a] p-4 rounded-xl items-center mt-5 w-48"
              onPress={handleSave}
            >
              {isLoding && <ActivityIndicator color={"#ffffff"} />}
              <Text className="text-black font-bold">Save me</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
