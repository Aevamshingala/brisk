import axios from "axios";
import { create } from "zustand";
import { baseUrl } from "./url";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  register: async (userName, email, password) => {
    set({ isLoading: true });
    try {
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
      await AsyncStorage.setItem("user", JSON.stringify(data.data));

      set({ user: data.data, isLoading: false });
      return { success: true, message: data.message };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response.data.message };
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
      console.log(response);

      const data = response.data;
      if (!response) {
        throw new Error(data.message || "somthing went wrong");
      }
      await AsyncStorage.setItem("token", data.token);

      set({ token: data.token, user: data.data, isLoading: false });
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
}));
