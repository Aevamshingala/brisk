import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { EvilIcons, Fontisto, Ionicons } from "@expo/vector-icons";
import GoogleIcon from "../../components/google_icon";
import Signup from "./signup";
import { Image } from "expo-image";
import { useAuthStore } from "@/store/auth.Store";
const style = StyleSheet.create({
  background: {
    // backgroundImage:
    // "linear-gradient(to right,#333913,#333913, #080b01,#080b01,#080b01)",
    backgroundColor: "#1a1a1a",
  },
  glass: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(10px)", // Works on iOS, limited Android support
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
  },
});
export default function Login() {
  const [islogin, setIsLogin] = useState<boolean>(true);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    reValidateMode: "onChange",
  });

  const [isshow, setIsShow] = useState<boolean>(true);

  const { login, isLoading } = useAuthStore();

  const onsubmit = async (data: any) => {
    const { email, password } = data;

    const res = await login(email, password);

    return Alert.alert("Info", res.message);
  };
  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView className="h-full bg-[#1a1a1a]">
          <View className="h-full py-5" style={style.background}>
            <View className=" flex justify-center items-center mt-10">
              <Text className="text-3xl text-white">Sign Up or Login</Text>
            </View>
            <View className="mt-16 flex justify-center items-center">
              <View className="flex-row rounded-full" style={style.glass}>
                <TouchableOpacity
                  onPress={() => setIsLogin(true)}
                  style={islogin && style.glass}
                  className={`w-40 flex justify-center items-center  p-5 text-2xl rounded-full`}
                >
                  <Text className=" text-white">Login</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsLogin(false)}
                  style={!islogin && style.glass}
                  className="w-40 flex justify-center items-center p-5 text-2xl rounded-full"
                >
                  <Text className=" text-white">Sign Up</Text>
                </TouchableOpacity>
              </View>
              <View style={{ marginTop: 4 }}>
                <Image
                  source={require("../../assets/images/signin.png")}
                  style={{ width: 200, height: 200 }}
                  contentFit="cover"
                />
              </View>
            </View>

            {islogin ? (
              <>
                <View className="flex justify-center items-center mt-5">
                  <Controller
                    control={control}
                    rules={{
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    }}
                    render={({ field: { onBlur, onChange, value } }) => (
                      <View className="flex-row w-96 border-gray-500 border-2 rounded-2xl mt-5 h-14">
                        <Fontisto
                          name="email"
                          size={20}
                          color="gray"
                          className="flex align-middle mr-5 ml-5"
                        />
                        <TextInput
                          placeholder="Email Address"
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          placeholderTextColor={"#ffffff"}
                          className="text-white w-60 border-none"
                        />
                      </View>
                    )}
                    name="email"
                  />

                  <Controller
                    control={control}
                    rules={{
                      required: "Password is requird",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    }}
                    render={({ field: { onBlur, onChange, value } }) => (
                      <View className="flex-row w-96 border-gray-500 border-2 rounded-2xl mt-5 h-14">
                        <EvilIcons
                          name="lock"
                          size={25}
                          color="gray"
                          className="flex align-middle mr-5 ml-5"
                        />
                        <TextInput
                          placeholder="Password"
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          secureTextEntry={isshow}
                          placeholderTextColor={"#ffffff"}
                          className="text-gray-200 w-60"
                        />
                        <TouchableOpacity
                          onPress={() => setIsShow(!isshow)}
                          className=" flex-row items-center"
                        >
                          <View className="text-white">
                            {isshow ? (
                              <Ionicons
                                name="eye-outline"
                                size={25}
                                color="gray"
                                className="flex items-center mr-5 ml-5"
                              />
                            ) : (
                              <Ionicons
                                name="eye-off-outline"
                                size={25}
                                color="gray"
                                className="flex items-center mr-5 ml-5"
                              />
                            )}
                          </View>
                        </TouchableOpacity>
                      </View>
                    )}
                    name="password"
                  />
                  {errors.email?.type == "required" &&
                  errors.password?.type == "required" ? (
                    <>
                      <Text className="text-gray-300 mt-5">
                        <Text className="text-white">Oops!!!</Text> Please fill
                        all Details
                      </Text>
                    </>
                  ) : (
                    <>
                      {errors.email && (
                        <Text className="text-gray-300 mt-5">
                          <Text className="text-white">Oops!!!</Text>{" "}
                          {errors?.email?.message}
                        </Text>
                      )}
                      {errors.password && (
                        <Text className="text-gray-300 mt-5">
                          <Text className="text-white">Oops!!!</Text>{" "}
                          {errors?.password?.message}
                        </Text>
                      )}
                    </>
                  )}
                </View>
                <View className="flex justify-center items-center mt-10">
                  <TouchableOpacity onPress={handleSubmit(onsubmit)}>
                    {isLoading && (
                      <>
                        <ActivityIndicator color={"#ffffff"} />
                      </>
                    )}
                    <Text className="bg-[#f5bb4a] w-56 h-12 rounded-full text-center align-middle text-[#0a0a0a] text-xl">
                      Login
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <Signup />
            )}
            <View className=" flex justify-center items-center">
              <View className="flex-row m-8">
                <View className="bg-gray-200 w-32 h-0.5 mt-3 mr-2" />
                <Text className="text-gray-200 ">or login with</Text>
                <View className="bg-gray-200 w-32 h-0.5 mt-3 ml-2" />
              </View>
            </View>
            <View className="flex justify-center items-center">
              <View className="flex-row items-center border-gray-200 border-2 w-fit p-5 px-10 rounded-full justify-center">
                <View className="mr-5">
                  <GoogleIcon />
                </View>
                <Text className="text-white">Google</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
