import React, { useState } from "react";
import {
  Text,
  View,
  Alert,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import axios from "axios";
import { baseUrl } from "@/store/url";
import { useAuthStore } from "@/store/auth.Store";

export default function GalleryPicker() {
  const [image, setImage] = useState<string[]>([]);
  const [isLoding, setIsLoding] = useState(false);
  const { token } = useAuthStore();

  const pickImage = async () => {
    // Ask for media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    // Launch the image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 1,
      selectionLimit: 10,
      allowsMultipleSelection: true,
      base64: false,
      orderedSelection: true,
    });

    if (!result.canceled) {
      const imagArray = result.assets.map((resu) => {
        return resu.uri;
      });
      setImage(imagArray);
    }
  };

  const handleCreate = async () => {
    const data = new FormData();
    image.forEach((imgUri, index) => {
      const uriParts = imgUri.split(".");
      const fileType = uriParts[uriParts.length - 1];

      data.append("images", {
        uri: imgUri,
        name: `image${index}.${fileType}`,
        type: `image/${fileType}`,
      } as any);
    });

    try {
      setIsLoding(true);
      const response = await axios.post(
        `${baseUrl}/api/v1/qr/albumImages`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsLoding(false);
      if (!response) {
        Alert.alert("upload", "image upload failed");
      }

      const imageId = response.data?.data?.imageCreate?._id;

      router.push({ pathname: "/frams/qrcode", params: { imageId } });
    } catch (error: any) {
      console.error("Upload error:", error.response?.data || error.message);
    } finally {
      setIsLoding(false);
    }
  };

  return (
    <ScrollView className="h-full bg-[#1a1a1a]">
      <View className="flex-1 items-center justify-start bg-[#1a1a1a] p-6">
        {/* Animated Header */}
        <View className="mt-12 mb-8">
          <Text className="text-white text-4xl font-bold text-center tracking-tighter">
            Create Your Visual Story with
          </Text>
          <View className="flex-row justify-center items-center mt-3">
            <Text className="text-[#f5bc4a] text-5xl font-extrabold tracking-tight">
              BRISK
            </Text>
            <View className="ml-2 w-3 h-3 bg-[#f5bc4a] rounded-full animate-pulse" />
          </View>
        </View>

        {/* Decorative Elements */}
        <View className="absolute top-20 left-5 w-4 h-4 bg-[#f5bc4a]/30 rounded-full" />
        <View className="absolute bottom-40 right-8 w-6 h-6 bg-[#f5bc4a]/20 rounded-full" />

        {/* Main CTA */}
        <TouchableOpacity
          onPress={pickImage}
          activeOpacity={0.7}
          className="mt-10 mb-12 transform active:scale-95 transition-all duration-150"
        >
          <View className="bg-[#f5bc4a] w-72 h-16 rounded-full flex items-center justify-center ">
            <Text className="text-[#0a0a0a] text-xl font-bold tracking-wide">
              SELECT IMAGES
            </Text>
            <View className="absolute -right-2 -top-2 bg-white w-8 h-8 rounded-full flex items-center justify-center shadow border-black border-2">
              <Text className="text-[#222222] font-bold text-lg">+</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Gallery Section */}
        {image.length > 0 ? (
          <View className="flex-1 w-full">
            <Text className="text-white/80 text-lg font-medium mb-4 ml-2 ">
              Your Selections ({image.length})
            </Text>
            <View className="flex justify-center items-center">
              <FlatList
                renderItem={({ item }) => (
                  <View className="mr-4 rounded-2xl overflow-hidden shadow-2xl bg-[#2a2a2a] mt-2">
                    <Image
                      source={{ uri: item }}
                      style={{ width: 150, height: 150 }}
                      contentFit="cover"
                    />
                  </View>
                )}
                data={image}
                numColumns={2}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => `image-${index}`}
              />
            </View>
            {/* Main CTA */}
            <View className="flex justify-center items-center">
              <TouchableOpacity
                onPress={handleCreate}
                activeOpacity={0.7}
                className="mt-10 mb-12 transform active:scale-95 transition-all duration-150"
              >
                <View className="bg-[#f5bc4a] w-72 h-16 rounded-full flex items-center justify-center shadow-2xl shadow-[#f5bc4a]/40">
                  {isLoding && <ActivityIndicator color={"#ffffff"} />}
                  <Text className="text-[#0a0a0a] text-xl font-bold tracking-wide">
                    Create
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="flex-1 items-center justify-center opacity-85">
            <View className="border-2 border-dashed border-[#f5bc4a]/30 rounded-3xl w-64 h-72 flex items-center justify-center">
              <Image
                source={require("../../assets/images/Camera-bro.png")}
                style={{ width: 200, height: 200 }}
                contentFit="cover"
              />
              <Text className="text-white mt-2 text-center px-6 mb-2">
                Your amazing photos will appear here
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
