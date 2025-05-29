import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  Animated,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Image } from "expo-image";
import { AntDesign } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { baseUrl } from "@/store/url";
import { useAuthStore } from "@/store/auth.Store";
import { useLocalSearchParams } from "expo-router";
export default function ImageDownload() {
  const [download, setDownload] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);

  const { scannedData } = useLocalSearchParams();

  const [images, setImages] = useState([]);
  const { token } = useAuthStore();
  useEffect(() => {
    const fetchImage = async () => {
      const response = await fetch(`${baseUrl}/api/v1/qr/getimages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imagesId: scannedData }),
      });
      if (response.status != 200) {
        Alert.alert("Problem", "somthing went Wrong");
        return;
      } else {
        const data = await response.json();

        setImages(data?.data?.images);
      }
    };
    fetchImage();
  }, []);

  const handleSaveToGallery = async () => {
    try {
      // Request permissions first
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (download.length <= 0) {
        Alert.alert("Select Image", "Please select Image.");
        return;
      }
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please allow access to your photos to save QR codes."
        );
        return;
      }
      const album = await MediaLibrary.getAlbumAsync("Brisk");

      // Process images sequentially
      for (const imageUrl of download) {
        try {
          // First download the image
          const downloadResponse = await FileSystem.downloadAsync(
            imageUrl,
            FileSystem.documentDirectory + "tempImage.jpg"
          );

          // Then save to gallery
          const asset = await MediaLibrary.createAssetAsync(
            downloadResponse.uri
          );

          if (album === null) {
            await MediaLibrary.createAlbumAsync("Brisk", asset, false);
          } else {
            await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
          }
        } catch (error) {
          console.error(`Failed to save image ${imageUrl}:`, error);
        } finally {
          // Clean up temporary file
          await FileSystem.deleteAsync(
            FileSystem.documentDirectory + "tempImage.jpg",
            { idempotent: true }
          );
        }
      }

      Alert.alert("Success", "Successfully  save photos to gallery.");
    } catch (error) {
      Alert.alert("Error", "Failed to save photos to gallery.");
      console.error(error);
    }
  };
  const handleSelect = (item: any) => {
    if (download.some((d) => d === item)) {
      setDownload(download.filter((d) => d !== item));
    } else {
      setDownload((prv) => [...prv, item]);
    }
  };

  const render = (items: any) => {
    const isSelected = download.includes(items.item);

    return (
      <TouchableOpacity
        onPress={() => handleSelect(items.item)}
        activeOpacity={0.8}
        className="relative group active:scale-95 transition-all duration-300 m-1"
      >
        {/* Main Image Container with Overlay Effects */}
        <View className="relative overflow-hidden rounded-xl">
          <Image
            source={{
              uri: "https://res.cloudinary.com/dlekzj6ii/image/upload/v1748418718/mjylujc6gawi7mc9cc7c.jpg",
            }}
            style={{ width: 160, height: 160, resizeMode: "cover" }}
            contentFit="cover"
            className={`transition-opacity duration-300 ${
              isSelected ? "opacity-70" : "opacity-100"
            }`}
          />

          {/* Animated Selection Overlay */}
          {isSelected && (
            <View className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <Animated.View
                className="w-12 h-12 bg-emerald-400/90 rounded-full flex items-center justify-center"
                style={{
                  transform: [{ scale: isSelected ? 1 : 0.8 }],
                  opacity: isSelected ? 1 : 0,
                }}
              ></Animated.View>
            </View>
          )}
        </View>

        {/* Floating Selection Indicator (Modern Design) */}
        <View
          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center  transition-all duration-200
            ${
              isSelected ? "bg-emerald-500 scale-110" : "bg-white/90 scale-110"
            }`}
        >
          <Text>
            {isSelected ? (
              <AntDesign name="check" size={24} color="white" />
            ) : (
              <AntDesign name="close" size={24} color="white" />
            )}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  const handleAllSelect = () => {
    if (selectAll) {
      setDownload(images);
    } else {
      setDownload([]);
    }
    setSelectAll(!selectAll);
  };

  return (
    <View className="p-4 items-center bg-[#1a1a1a] h-full">
      <View className="mt-12 mb-8">
        <Text className="text-white text-4xl font-bold text-center tracking-tighter">
          Save Story with
        </Text>
        <View className="flex-row justify-center items-center mt-3">
          <Text className="text-[#f5bc4a] text-5xl font-extrabold tracking-tight">
            BRISK
          </Text>
          <View className="ml-2 w-3 h-3 bg-[#f5bc4a] rounded-full animate-pulse" />
        </View>
      </View>
      {/* Header with action buttons */}
      <View className="flex-row justify-between w-full mb-6">
        <TouchableOpacity
          onPress={handleSaveToGallery}
          className="bg-[#f5bb4a] px-6 py-3 rounded-full flex-1 mr-2"
          activeOpacity={0.8}
        >
          <Text className="text-[#0a0a0a] text-lg font-semibold text-center">
            Save to Gallery
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleAllSelect}
          className={`px-6 py-3 rounded-full flex-1 ml-2 ${
            selectAll ? "bg-[#4a7af5]" : "bg-[#f57a4a]"
          }`}
          activeOpacity={0.8}
        >
          <Text className="text-white text-lg font-semibold text-center">
            {selectAll ? "Select All" : "Manual Select"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Image grid */}
      <FlatList
        renderItem={render}
        data={images}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 20 }}
        columnWrapperStyle={{ justifyContent: "space-evenly" }}
        className="w-full"
      />
    </View>
  );
}
