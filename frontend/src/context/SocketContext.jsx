import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

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

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};
