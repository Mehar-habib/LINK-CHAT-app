import Message from "../models/MessagesModel.js";

export const getMessages = async (req, res, next) => {
  try {
    // Extract the ID of the currently logged-in user from the request (middleware assumed to set this)
    const user1 = req.user.userId;

    // Extract the ID of the other user from the request body
    const user2 = req.body.id;

    // Validate that both user IDs are provided
    if (!user1 || !user2) {
      return res.status(400).json({ message: "Both user ID's are required" });
    }

    // Find all messages where:
    // - user1 is the sender and user2 is the recipient, OR
    // - user2 is the sender and user1 is the recipient
    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 },
      ],
    }).sort({ timestamp: 1 }); // Sort messages in ascending order of timestamp

    // Return the retrieved messages
    return res.status(200).json({ messages });
  } catch (error) {
    // Log and return any server error
    console.log({ error });
    return res.status(500).json({ message: error.message });
  }
};
