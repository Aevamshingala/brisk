import { useAuthStore } from "@/store/auth.Store";
import { baseUrl } from "../../../store/url.js";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Image } from "expo-image";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
interface QRData {
  id: string;
  title: string;
  qrcode: string;
  message: string;
  createdAt: string;
}

export default function Profile() {
  const { user, token, logout, updateuser } = useAuthStore();
  const [memberSince, setMemberSince] = useState("");
  const [imageUrl, setImageUrl] = useState(
    user?.avatar
      ? { uri: user.avatar }
      : require("../../../assets/images/profile.png")
  );
  const [qrData, setQrData] = useState<QRData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getDate()} ${date.toLocaleDateString("en-US", {
      month: "long",
    })}`;
  };

  useEffect(() => {
    const fetchQrData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${baseUrl}/api/v1/qr/myqr`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status !== 200) {
          throw new Error("Something went wrong");
        }

        const data = await response.json();

        const formattedData = data.data.map((ele: any) => ({
          id: ele?._id,
          title: ele?.title || "Untitled",
          message: ele?.message || "",
          qrcode: ele?.qrCode || "",
          createdAt: formatDate(ele?.createdAt),
        }));

        setQrData(formattedData);
      } catch (error: any) {
        Alert.alert("Error", error.message || "Failed to fetch QR data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQrData();
  }, [token]);

  useEffect(() => {
    if (user?.createdAt) {
      setMemberSince(`Member since ${formatDate(user?.createdAt)}`);
    }

    if (user?.avatar && user.avatar !== imageUrl?.uri) {
      setImageUrl({ uri: user.avatar });
    }
  }, [user]);

  const changeProfilePicture = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "We need camera roll permissions to access your photos"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]?.uri) return;

      const formData = new FormData();
      formData.append("profilepic", {
        uri: result.assets[0].uri,
        name: result.assets[0].fileName || `profile-${Date.now()}.jpg`,
        type: result.assets[0].mimeType || "image/jpeg",
      } as any);

      setIsLoadingImage(true);
      const response = await fetch(`${baseUrl}/api/v1/user/profilepic`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const res = await response.json();
      const data = updateuser();
      await AsyncStorage.setItem("user", data);
      setImageUrl({ uri: res.data?.avatar?.url });
      Alert.alert("Info", "profile picture updated sucessfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile picture");
    } finally {
      setIsLoadingImage(false);
    }
  };

  return (
    <View className="flex-1 bg-[#1a1a1a] p-4">
      {/* Profile Header */}
      <View className="items-center mb-8 mt-8">
        <View className="relative">
          <Image
            source={imageUrl}
            className="w-32 h-32 rounded-full border-4 border-[#f5bb4a]"
            accessibilityLabel="Profile picture"
            style={{ width: 100, height: 100, borderRadius: 50 }}
          />
          <TouchableOpacity
            className="absolute bottom-0 right-0 bg-[#f5bb4a] p-2 rounded-full"
            onPress={changeProfilePicture}
            disabled={isLoading}
          >
            {isLoadingImage ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Ionicons name="camera" size={16} color="#1a1a1a" />
            )}
          </TouchableOpacity>
        </View>
        <Text className="text-2xl font-bold text-[#fecb67] mt-4">
          {user?.userName || "User"}
        </Text>
        <Text className="text-gray-400">{memberSince}</Text>
        <TouchableOpacity
          className="flex justify-center items-center bg-red-500 m-3 py-2 px-5 rounded-2xl"
          onPress={logout}
        >
          <Text className="text-white text-center">Logout</Text>
        </TouchableOpacity>
      </View>

      {/* QR Code Posts */}
      {isLoading && qrData.length === 0 ? (
        <View className="flex-1 items-center justify-center  mt-5">
          <ActivityIndicator size="large" color="#f5bb4a" />
        </View>
      ) : qrData.length > 0 ? (
        <FlatList
          data={qrData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="mb-6 bg-[#252525] rounded-lg overflow-hidden">
              <View className="flex items-center justify-center mt-5">
                <Image
                  source={{ uri: item?.qrcode }}
                  className="w-full h-96"
                  style={{ width: 200, height: 200 }}
                  resizeMode="cover"
                  contentFit="cover"
                  accessibilityLabel={`QR Code for ${item.title}`}
                />
              </View>
              <View className="p-4">
                <Text className="text-xl font-bold text-[#f5bb4a] mb-1">
                  {item.title}
                </Text>
                <Text className="text-white mb-2">{item.message}</Text>
                <Text className="text-gray-400 text-sm">
                  Created: {item.createdAt}
                </Text>
              </View>
            </View>
          )}
        />
      ) : (
        <View className="flex-1 items-center justify-center opacity-85">
          <View className="border-2 border-dashed border-[#f5bc4a]/30 rounded-3xl w-64 h-72 flex items-center justify-center -mt-40">
            <Image
              source={require("../../../assets/images/QR Code-bro.png")}
              style={{ width: 200, height: 200 }}
              contentFit="cover"
              accessibilityLabel="No QR codes illustration"
            />
            <Text className="text-white mt-2 text-center px-6 mb-2">
              Create QR code with Brisk
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
