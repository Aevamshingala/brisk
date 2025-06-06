import axios from "axios";
import { create } from "zustand";
import { baseUrl } from "./url";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  register: async (userName, email, password) => {
    try {
      set({ isLoading: true });
      const response = await axios.post(
        `${baseUrl}/api/v1/user/register`,
        { userName, email, password },
        {
          Headers: { "Content-Types": "application/json" },
        }
      );

      const data = response.data;
      if (!response) {
        throw new Error(data.message || "somthing went wrong");
      }
      await AsyncStorage.setItem("user", JSON.stringify(data.data?.user));

      set({ user: data.data?.user, isLoading: false });
      return { success: true, message: data.message };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message };
    }
  },

  login: async (email, password) => {
    try {
      set({ isLoading: true });

      const response = await axios.post(
        `${baseUrl}/api/v1/user/login`,
        { email, password },
        {
          Headers: { "Content-Types": "application/json" },
        }
      );

      const data = response.data;
      if (!response) {
        throw new Error(data.message || "somthing went wrong");
      }

      await AsyncStorage.setItem("user", JSON.stringify(data?.data?.user));
      await AsyncStorage.setItem("token", data.token);

      set({ token: data.token, user: data?.data?.user, isLoading: false });
      return { success: true, message: data.message };
    } catch (error) {
      set({ isLoading: false });
      console.log(error);
      return { success: false, error: error.response.data.message };
    }
  },

  checkAuth: async () => {
    try {
      const userjson = await AsyncStorage.getItem("user");
      const token = await AsyncStorage.getItem("token");

      const user = userjson ? JSON.parse(userjson) : null;
      set({ user, token });
    } catch (error) {
      console.log("error in check auth", error);
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("token");

    set({ user: null, token: null });
  },

  updateuser: async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      console.log(token);

      const response = await fetch(`${baseUrl}/api/v1/user/getdata`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(response.json());

      const data = await response.json();
      console.log(data);

      set({ user: data });
      await AsyncStorage.setItem("user", JSON.stringify(data.data));
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  },
}));
