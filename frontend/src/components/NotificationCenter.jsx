import { useEffect } from "react";
import { Toaster, toast } from "sonner";
import useNotificationStore from "../store/notificationStore";

export default function NotificationCenter() {
  const notifications = useNotificationStore((state) => state.notifications);
  const removeNotification = useNotificationStore((state) => state.removeNotification);

  useEffect(() => {
    if (!notifications.length) return;

    notifications.forEach((notification) => {
      const { id, type, title, message, duration } = notification;

      toast[type === "error" ? "error" : type === "success" ? "success" : "info"](
        title || message,
        {
          id,
          description: title ? message : undefined,
          duration,
        }
      );

      removeNotification(id);
    });
  }, [notifications, removeNotification]);

  return <Toaster richColors closeButton position="top-right" />;
}
