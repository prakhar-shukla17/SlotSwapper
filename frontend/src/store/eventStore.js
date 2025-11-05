import { create } from "zustand";
import axios from "../api/axiosInstance";

const useEventStore = create((set) => ({
  events: [],
  isLoading: false,

  fetchEvents: async () => {
    set({ isLoading: true });
    const res = await axios.get("/events");
    set({ events: res.data.data.events, isLoading: false });
  },

  createEvent: async (data) => {
    const res = await axios.post("/events", data);
    set((state) => ({ events: [...state.events, res.data.data.event] }));
  },

  updateEventStatus: async (id, status) => {
    await axios.patch(`/events/${id}/status`, { status });
    set((state) => ({
      events: state.events.map((e) =>
        e._id === id ? { ...e, status } : e
      ),
    }));
  },
}));

export default useEventStore;
