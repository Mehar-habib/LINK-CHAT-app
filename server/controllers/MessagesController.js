import Message from "../models/MessagesModel.js";
import { mkdirSync, renameSync } from "fs";

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

// Controller: handle single-file uploads from the client and save the file
export const uploadFile = async (req, res, next) => {
  try {
    // ───────────────────────────────────────────────────────────────────────────
    // 1) Validate that Multer attached a file to the request
    // ───────────────────────────────────────────────────────────────────────────
    if (!req.file) {
      return res.status(400).json({ message: "Please provide a file" });
    }

    // ───────────────────────────────────────────────────────────────────────────
    // 2) Build a unique directory & filename
    //    • `date` gives us a millisecond timestamp for uniqueness
    //    • Final path will look like:  uploads/files/1718039123456/myDoc.pdf
    // ───────────────────────────────────────────────────────────────────────────
    const date = Date.now(); // e.g. 1718039123456
    const fileDir = `uploads/files/${date}`; // upload folder
    const fileName = `${fileDir}/${req.file.originalname}`;

    // ───────────────────────────────────────────────────────────────────────────
    // 3) Create the directory (recursively) and move the temp upload there
    //    Multer stores the temp file at `req.file.path`
    // ───────────────────────────────────────────────────────────────────────────
    mkdirSync(fileDir, { recursive: true }); // create folder if it doesn’t exist
    renameSync(req.file.path, fileName); // move file → final location

    // ───────────────────────────────────────────────────────────────────────────
    // 4) Success response: send back the saved file path
    // ───────────────────────────────────────────────────────────────────────────
    return res.status(200).json({ filePath: fileName });
  } catch (error) {
    // On error: log it and respond with 500
    console.log({ error });
    return res.status(500).json({ message: error.message });
  }
};
