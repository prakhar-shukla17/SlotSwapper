import { create } from "zustand";
import axios from "../api/axiosInstance";

const useSwapStore = create((set, get) => ({
  swappableSlots: [],
  sentRequests: [],
  receivedRequests: [],
  isLoading: false,
  error: null,

  fetchSwappableSlots: async () => {
    try {
      set({ isLoading: true, error: null });
      const res = await axios.get("/swaps/swappable-slots");
      set({ swappableSlots: res.data.data.slots || [], isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || err.message, isLoading: false });
    }
  },

  createSwapRequest: async (requesterEventId, requestedEventId, message = "") => {
    try {
      set({ isLoading: true, error: null });
      const res = await axios.post("/swaps", {
        requesterEventId,
        requestedEventId,
        message,
      });

      const { swapRequest } = res.data.data ?? {};

      await Promise.all([
        get().fetchSentRequests(),
        get().fetchReceivedRequests(),
        get().fetchSwappableSlots(),
      ]);

      set({ isLoading: false });
      return { success: true, swapRequest, requestedEventId, requesterEventId };
    } catch (err) {
      const messageText = err.response?.data?.message || "Failed to create swap request";
      set({ error: messageText, isLoading: false });
      return { success: false, error: messageText };
    }
  },

  fetchSentRequests: async () => {
    try {
      const res = await axios.get("/swaps/sent");
      set({ sentRequests: res.data.data.swapRequests || [] });
    } catch (err) {
      set({ error: err.response?.data?.message || err.message });
    }
  },

  fetchReceivedRequests: async () => {
    try {
      const res = await axios.get("/swaps/received");
      set({ receivedRequests: res.data.data.swapRequests || [] });
    } catch (err) {
      set({ error: err.response?.data?.message || err.message });
    }
  },

  respondToSwapRequest: async (id, accepted) => {
    try {
      await axios.patch(`/swaps/${id}/respond`, { accepted });
      await Promise.all([
        get().fetchReceivedRequests(),
        get().fetchSentRequests(),
      ]);
    } catch (err) {
      console.error(err);
    }
  },

  cancelSwapRequest: async (id) => {
    try {
      await axios.delete(`/swaps/${id}`);
      await get().fetchSentRequests();
    } catch (err) {
      console.error(err);
    }
  },
}));

export default useSwapStore;
