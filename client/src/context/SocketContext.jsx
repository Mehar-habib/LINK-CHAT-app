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

      // Handle incoming messages in the client
      const handleReceiveMessage = (message) => {
        // Extract the current selected chat and the addMessage function from the global state
        const { selectedChatData, selectedChatType, addMessage } =
          useAppStore.getState();

        // Check if a chat is selected and the message belongs to the currently open chat
        if (
          selectedChatType !== undefined &&
          (selectedChatData._id === message.sender._id || // Message is from the person currently being chatted with
            selectedChatData._id === message.recipient._id) // or sent to the person currently being chatted with
        ) {
          console.log("Received message:", message);
          // Add the incoming message to the chat window
          addMessage(message);
        }
      };

      const handleReceiveChannelMessage = (message) => {
        const { selectedChatData, selectedChatType, addMessage } =
          useAppStore.getState();
        if (
          selectedChatType !== undefined &&
          selectedChatData._id === message.channelId
        ) {
          addMessage(message);
        }
      };

      socket.current.on("receiveMessage", handleReceiveMessage);
      socket.current.on("receive-channel-message", handleReceiveChannelMessage);
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
