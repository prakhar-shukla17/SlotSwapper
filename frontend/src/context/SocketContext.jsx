import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import useAuthStore from "../store/authStore";
import useNotificationStore from "../store/notificationStore";
import useSwapStore from "../store/swapStore";
import useEventStore from "../store/eventStore";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const userId = useAuthStore((state) => state.user?.id);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const fetchReceivedRequests = useSwapStore((state) => state.fetchReceivedRequests);
  const fetchSentRequests = useSwapStore((state) => state.fetchSentRequests);
  const fetchSwappableSlots = useSwapStore((state) => state.fetchSwappableSlots);
  const fetchEvents = useEventStore((state) => state.fetchEvents);
  const lastHandledSwap = useRef(new Set());

  const endpoint = useMemo(() => {
    const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
    return baseUrl.replace(/\/$/, "");
  }, []);

  useEffect(() => {
    const newSocket = io(endpoint, {
      withCredentials: true,
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [endpoint]);

  useEffect(() => {
    if (!socket) return;

    if (!userId) {
      if (socket.connected) {
        socket.disconnect();
      }
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }

    const identify = () => {
      socket.emit("user:identify", { userId });
    };

    identify();
    socket.on("connect", identify);

    return () => {
      socket.off("connect", identify);
    };
  }, [socket, userId]);

  useEffect(() => {
    if (!socket || !userId) return;

    const buildSlotSummary = (swapRequest) => {
      const requesterEvent = swapRequest?.requesterEvent;
      const requestedEvent = swapRequest?.requestedEvent;
      if (!requesterEvent || !requestedEvent) return "a swap request";
      const requesterTitle = requesterEvent.title ?? "their slot";
      const requestedTitle = requestedEvent.title ?? "your slot";
      return `${requesterTitle} ↔ ${requestedTitle}`;
    };

    const handleNewSwap = ({ swapRequest, actorId }) => {
      if (!swapRequest || !swapRequest._id) return;

      if (lastHandledSwap.current.has(`new-${swapRequest._id}`)) return;
      lastHandledSwap.current.add(`new-${swapRequest._id}`);

      const requesterName = swapRequest.requester?.name ?? "Someone";

      addNotification({
        type: "info",
        title: "New swap request",
        message: `${requesterName} wants to swap ${buildSlotSummary(swapRequest)}.`,
      });

      fetchReceivedRequests();
      fetchEvents();
      fetchSwappableSlots();
    };

    const handleSwapUpdate = ({ swapRequest, action, actorId }) => {
      if (!swapRequest || !swapRequest._id || !action) return;

      const key = `${action}-${swapRequest._id}-${actorId ?? ""}`;
      if (lastHandledSwap.current.has(key)) return;
      lastHandledSwap.current.add(key);

      const requesterId = swapRequest.requester?._id?.toString?.() ?? swapRequest.requester?._id ?? swapRequest.requester?.id;
      const requestedToId = swapRequest.requestedTo?._id?.toString?.() ?? swapRequest.requestedTo?._id ?? swapRequest.requestedTo?.id;

      if (![requesterId, requestedToId].includes(userId)) return;

      const isRequester = requesterId === userId;
      const counterpartName = isRequester
        ? swapRequest.requestedTo?.name ?? "the other user"
        : swapRequest.requester?.name ?? "the requester";

      const slotSummary = buildSlotSummary(swapRequest);

      if (action === "accepted") {
        addNotification({
          type: "success",
          title: isRequester ? "Swap accepted" : "Swap confirmed",
          message: isRequester
            ? `${counterpartName} accepted your swap request for ${slotSummary}.`
            : `You accepted ${slotSummary}.`,
        });
      } else if (action === "rejected") {
        addNotification({
          type: isRequester ? "error" : "info",
          title: isRequester ? "Swap rejected" : "Swap declined",
          message: isRequester
            ? `${counterpartName} declined your swap request for ${slotSummary}.`
            : `You declined the swap request for ${slotSummary}.`,
        });
      } else if (action === "cancelled") {
        const cancelledByMe = actorId === userId;
        addNotification({
          type: cancelledByMe ? "info" : "warning",
          title: cancelledByMe ? "Swap cancelled" : "Swap withdrawn",
          message: cancelledByMe
            ? `You cancelled the swap request for ${slotSummary}.`
            : `${counterpartName} cancelled the swap request for ${slotSummary}.`,
        });
      }

      fetchSentRequests();
      fetchReceivedRequests();
      fetchEvents();
      fetchSwappableSlots();
    };

    socket.on("swaps:new", handleNewSwap);
    socket.on("swaps:updated", handleSwapUpdate);

    return () => {
      socket.off("swaps:new", handleNewSwap);
      socket.off("swaps:updated", handleSwapUpdate);
    };
  }, [socket, userId, addNotification, fetchEvents, fetchReceivedRequests, fetchSentRequests, fetchSwappableSlots]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};
