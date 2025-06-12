import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  ScrollViewComponent,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { EvilIcons, Fontisto, Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/auth.Store.js";
const Signup = () => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
      confirmPassword: "",
    },
    reValidateMode: "onChange",
  });
  const password = watch("password");
  const [isshow, setIsShow] = useState<boolean>(true);
  const [isLoding, setIsLoding] = useState<boolean>(false);
  const [isshowCon, setIsShowCon] = useState<boolean>(false);
  const { register } = useAuthStore();
  const onsubmit = async (data: any) => {
    const { email, password } = data;
    const userName = data.name;
    setIsLoding(true);
    const res = await register(userName, email, password);
    console.log(res);

    setIsLoding(false);
    if (!res.success) {
      return Alert.alert("Problem", "somthing went wrong");
    } else {
      return Alert.alert(
        "Info",
        "you are registered successfully please login"
      );
    }
  };

  return (
    <View>
      <View className="flex justify-center items-center mt-5">
        <Controller
          control={control}
          rules={{
            required: "Name is required",
          }}
          render={({ field: { onBlur, onChange, value } }) => (
            <View className="flex-row w-96 border-gray-500 border-2 rounded-2xl mt-5 h-14">
              <Fontisto
                name="person"
                size={20}
                color="gray"
                className="flex align-middle mr-5 ml-5"
              />
              <TextInput
                placeholder="Name"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                autoCapitalize="none"
                placeholderTextColor={"#ffffff"}
                className="text-white w-60 border-none"
              />
            </View>
          )}
          name="name"
        />
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
                className="text-gray-200 w-60"
                placeholderTextColor={"#ffffff"}
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
        <Controller
          control={control}
          rules={{
            required: "Please confirm your password",
            validate: (value) => value === password || "passwords do not match",
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
                placeholder="confirm Password"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                secureTextEntry={isshowCon}
                placeholderTextColor={"#ffffff"}
                className="text-gray-200 w-60"
              />
              <TouchableOpacity
                onPress={() => setIsShowCon(!isshowCon)}
                className=" flex-row items-center"
              >
                <View className="text-white">
                  {isshowCon ? (
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
          name="confirmPassword"
        />
        {errors.email?.type == "required" &&
        errors.name?.type == "required" &&
        errors.password?.type == "required" &&
        errors.confirmPassword?.type == "required" ? (
          <>
            <Text className="text-gray-300 mt-5">
              <Text className="text-white">Oops!!!</Text> Please fill all
              Details
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
            {errors.confirmPassword && (
              <Text className="text-gray-300 mt-5">
                <Text className="text-white">Oops!!!</Text>{" "}
                {errors?.confirmPassword?.message}
              </Text>
            )}
            {errors.name && (
              <Text className="text-gray-300 mt-5">
                <Text className="text-white">Oops!!!</Text>{" "}
                {errors?.name?.message}
              </Text>
            )}
          </>
        )}
      </View>
      <View className="flex justify-center items-center mt-10">
        <TouchableOpacity onPress={handleSubmit(onsubmit)}>
          {isLoding && (
            <>
              <ActivityIndicator color={"#ffffff"} />
            </>
          )}
          <Text className="bg-[#f5bb4a] w-56 h-12 rounded-full text-center align-middle text-[#0a0a0a] text-xl">
            Sign up
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Signup;
