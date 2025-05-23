// Import required hooks and constants
import { useAppStore } from "@/store"; // Custom Zustand store to access global state (like user info)
import { HOST } from "@/utils/constants"; // Backend server URL for socket connection
import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client"; // Socket.IO client for real-time communication

// Create a React context to hold the socket instance
const SocketContext = createContext(null);

// Custom hook to access the socket context
export const useSocket = () => {
  return useContext(SocketContext);
};

// Context provider to manage socket connection and share it across the app
export const SocketProvider = ({ children }) => {
  const socket = useRef(); // useRef holds the socket instance persistently
  const { userInfo } = useAppStore(); // Get the currently logged-in user's info from the store

  useEffect(() => {
    // Only establish socket connection if user is logged in
    if (userInfo) {
      socket.current = io(HOST, {
        withCredentials: true, // Allow credentials (cookies, etc.)
        query: {
          userId: userInfo.id, // Pass user ID to the server via socket handshake query
        },
      });

      // Log when socket connection is successfully established
      socket.current.on("connect", () => {
        console.log("Connected to socket server");
      });

      // Cleanup function to disconnect socket when component unmounts or userInfo changes
      return () => {
        socket.current.disconnect();
      };
    }
  }, [userInfo]);

  // Provide the socket instance to all children components
  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
};
