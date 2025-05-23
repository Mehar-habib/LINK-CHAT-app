import { Server as SocketIOServer } from "socket.io";

const setupSocket = (server) => {
  // Initialize a new Socket.IO server instance with CORS settings
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.ORIGIN, // Allow connections only from this origin
      methods: ["GET", "POST"], // Allow only GET and POST methods
      credentials: true, // Allow cookies to be sent with requests
    },
  });

  // Create a map to keep track of connected users: userId => socket.id
  const userSocketMap = new Map();

  // Function to handle user disconnection
  const disconnect = (socket) => {
    console.log(`Client Disconnected: ${socket.id}`);

    // Remove the disconnected socket from the userSocketMap
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  };

  // Listen for new client connections
  io.on("connection", (socket) => {
    // Get the userId from the handshake query parameters
    const userId = socket.handshake.query.userId;

    if (userId) {
      // Store the mapping of userId to socket.id
      userSocketMap.set(userId, socket.id);
      console.log(`User connected: ${userId} with socket ID: ${socket.id}`);
    } else {
      // Log a message if userId was not provided
      console.log("User ID not Provided during connection.");
    }

    // Listen for client disconnection
    socket.on("disconnect", () => disconnect(socket));
  });
};

export default setupSocket;
