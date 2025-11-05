import { create } from "zustand";

let notificationCounter = 0;

const useNotificationStore = create((set) => ({
  notifications: [],

  addNotification: ({ id, type = "info", title, message, duration = 6000 }) => {
    const notificationId = id ?? `${Date.now()}-${notificationCounter++}`;
    const notification = { id: notificationId, type, title, message, duration };
    set((state) => ({ notifications: [...state.notifications, notification] }));
    return notificationId;
  },

  removeNotification: (id) =>
    set((state) => ({ notifications: state.notifications.filter((item) => item.id !== id) })),

  clearNotifications: () => set({ notifications: [] }),
}));

export default useNotificationStore;
