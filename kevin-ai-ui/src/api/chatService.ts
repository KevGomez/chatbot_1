import axiosInstance from "./axiosInstance";
import { ChatMessage } from "../types";

export const sendMessage = async (
  message: string
): Promise<{ response: string }> => {
  try {
    const response = await axiosInstance.post<{ response: string }>("/chat", {
      message,
    });
    return response.data;
  } catch (error) {
    console.error("Error in chat service:", error);
    throw error;
  }
};
