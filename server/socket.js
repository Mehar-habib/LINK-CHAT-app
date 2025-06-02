import { Server as SocketIOServer } from "socket.io";
import Message from "./models/MessagesModel.js";
import Channel from "./models/Channel.js";

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

  // Function to send a message and emit it to both sender and recipient via Socket.IO
  const sendMessage = async (message) => {
    // Get socket IDs of both sender and recipient from the user-socket map
    const senderSocketId = userSocketMap.get(message.sender);
    const recipientSocketId = userSocketMap.get(message.recipient);

    // Save the message to the database
    const createMessage = await Message.create(message);

    // Fetch the full message data with sender and recipient populated
    const messageData = await Message.findById(createMessage._id)
      .populate("sender", "id email firstName lastName image color")
      .populate("recipient", "id email firstName lastName image color");

    // Emit the message to the recipient if they are connected
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("receiveMessage", messageData);
    }

    // Emit the message back to the sender (for real-time UI update)
    if (senderSocketId) {
      io.to(senderSocketId).emit("receiveMessage", messageData);
    }
  };

  // Function to handle sending a message to a channel
  const sendChannelMessage = async (message) => {
    const { channelId, sender, content, messageType, fileUrl } = message;

    // 1. Create a new message document in the database
    const createMessage = await Message.create({
      sender,
      recipient: null, // No specific recipient in channel messages
      content,
      messageType,
      timestamp: new Date(),
      fileUrl,
    });

    // 2. Populate sender details (for frontend display purposes)
    const messageData = await Message.findById(createMessage._id)
      .populate("sender", "id email firstName lastName image color")
      .exec();

    // 3. Add the message to the corresponding channel's messages array
    await Channel.findByIdAndUpdate(channelId, {
      $push: { messages: createMessage._id },
    });

    // 4. Fetch the full channel with its members for broadcasting
    const channel = await Channel.findById(channelId).populate("members");

    // 5. Merge message data with the channelId for easy identification
    const finalData = { ...messageData._doc, channelId: channel._id };

    // 6. Emit the message to all online channel members (and admin)
    if (channel && channel.members) {
      channel.members.forEach((member) => {
        const memberSocketId = userSocketMap.get(member._id.toString());
        if (memberSocketId) {
          io.to(memberSocketId).emit("receive-channel-message", finalData);
        }

        // Also emit the message to the channel admin
        const adminSocketId = userSocketMap.get(channel.admin.toString());
        if (adminSocketId) {
          io.to(adminSocketId).emit("receive-channel-message", finalData);
        }
      });
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

    socket.on("sendMessage", sendMessage);
    socket.on("send-channel-message", sendChannelMessage);
    // Listen for client disconnection
    socket.on("disconnect", () => disconnect(socket));
  });
};

export default setupSocket;
