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

interface qrdata {
  id: string;
  title: string;
  qrcode: string;
  message: string;
  createdAt: string;
}
export default function Profile() {
  const { user, token, logout } = useAuthStore();
  const [memberSince, setMemberSince] = useState("");
  const [imageUrl, setImageUrl] = useState(
    "https://cdn.pixabay.com/photo/2021/10/07/00/48/boat-6686952_1280.jpg"
  );
  const [qrdata, setQrData] = useState<qrdata[]>([]);
  const fixDate = (ele: any) => {
    const date = new Date(ele?.createdAt);
    return ` ${date.getDate()} ${date.toLocaleDateString("en-US", {
      month: "long",
    })}`;
  };
  const [isLoding, setIsLoding] = useState(false);

  useEffect(() => {
    const getqrdata = async () => {
      const response = await fetch(`${baseUrl}/api/v1/qr/myqr`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.status != 200) {
        Alert.alert("problem", "somthing went wrong");
      } else {
        const qrMapData = data.data.map((ele: any) => {
          return {
            id: ele?._id,
            title: ele?.title,
            message: ele?.message,
            qrcode: ele?.qrCode,
            createdAt: fixDate(ele),
          };
        });
        setQrData(qrMapData);
      }
    };
    getqrdata();
  }, []);

  useEffect(() => {
    const date = new Date(user?.createdAt);
    const userSince = `Member since ${date.getDate()} ${date.toLocaleDateString(
      "en-US",
      { month: "long" }
    )}`;
    setMemberSince(userSince);
  }, [user]);

  const changePropic = async () => {
    // Ask for media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    // Launch the image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images", // or Videos, or All
      quality: 0.8,
      base64: false,
    });

    if (!result.canceled) {
      const imag = result.assets[0].uri;

      const data = new FormData();
      data.append("profilepic", {
        uri: imag, // file://...
        name: result.assets[0]?.fileName,
        type: result.assets[0]?.mimeType,
      } as any);
      setIsLoding(true);

      const response = await fetch(`${baseUrl}/api/v1/user/profilepic`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });
      setIsLoding(false);

      if (response.status == 200) {
        const res = await response.json();
        setImageUrl(res.data?.avatar);
      } else {
        Alert.alert("problem", "something went wrong");
      }
    }
  };

  return (
    <View className="flex-1 bg-[#1a1a1a] p-4">
      {/* Profile Header */}
      <View className="items-center mb-8">
        <View className="relative">
          <Image
            source={{
              uri: imageUrl,
            }}
            className="w-32 h-32 rounded-full border-4 border-[#f5bb4a]"
          />
          <TouchableOpacity
            className="absolute bottom-0 right-0 bg-[#f5bb4a] p-2 rounded-full"
            onPress={changePropic}
          >
            {isLoding ? (
              <ActivityIndicator color={"#ffffff"} />
            ) : (
              <Ionicons name="camera" size={16} color="#1a1a1a" />
            )}
          </TouchableOpacity>
        </View>
        <Text className="text-2xl font-bold text-[#fecb67] mt-4">
          {user?.userName}
        </Text>
        <Text className="text-gray-400">{memberSince}</Text>
        <TouchableOpacity
          className="
          flex justify-center items-center bg-red-300 mt-3 py-2 px-5 rounded-2xl"
          onPress={logout}
        >
          <Text className="text-white text-center">Logout</Text>
        </TouchableOpacity>
      </View>

      {/* QR Code Posts */}
      <FlatList
        data={qrdata}
        keyExtractor={(item) => item?.id}
        renderItem={({ item }) => (
          <View className="mb-6 bg-[#252525] rounded-lg overflow-hidden">
            <Image source={{ uri: item.qrcode }} className="w-full h-96" />
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
      {qrdata.length <= 0 && (
        <View className="flex-1 items-center justify-center opacity-85">
          <View className="border-2 border-dashed border-[#f5bc4a]/30 rounded-3xl w-64 h-72 flex items-center justify-center -mt-40">
            <Image
              source={require("../../../assets/images/QR Code-bro.png")}
              style={{ width: 200, height: 200 }}
              contentFit="cover"
            />
            <Text className="text-white mt-2 text-center px-6 mb-2">
              Create qr code with Brisk
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
