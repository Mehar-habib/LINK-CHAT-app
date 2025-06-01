import mongoose from "mongoose";
import Message from "../models/MessagesModel.js";
import User from "../models/UserModel.js";

export const searchContacts = async (req, res, next) => {
  try {
    const { searchTerm } = req.body;
    if (searchTerm === undefined || searchTerm === null) {
      return res.status(400).json({ message: "Please provide a search term" });
    }

    // Escape special characters in searchTerm to safely use in regex
    // This prevents regex injection or errors
    const sanitizedSearchTerm = searchTerm.replace(
      /[.*+?^${}()|[/]\\]/g,
      "\\$&"
    );

    // Create a case-insensitive regular expression for the searchTerm
    const regex = new RegExp(sanitizedSearchTerm, "i");

    // Query the User collection to find contacts that:
    // - Are NOT the currently authenticated user (exclude by _id)
    // - Match the regex in either firstName, lastName, or email fields
    const contacts = await User.find({
      $and: [
        // Exclude the currently authenticated user from the search results
        { _id: { $ne: req.user.userId } },

        // Match documents where any of the following fields contain the search term (case-insensitive)
        {
          $or: [
            { firstName: regex }, // firstName matches the regex
            { lastName: regex }, // lastName matches the regex
            { email: regex }, // email matches the regex
          ],
        },
      ],
    });

    return res.status(200).json({ contacts });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: error.message });
  }
};

// This function retrieves the list of unique direct message (DM) contacts for the logged-in user,
// along with the time of the latest message exchanged with each contact.

export const getContactsForDMList = async (req, res, next) => {
  try {
    // Extract and convert the current user's ID to a MongoDB ObjectId
    let { userId } = req.user;
    userId = new mongoose.Types.ObjectId(userId);

    // MongoDB aggregation pipeline to get DM contacts
    const contacts = await Message.aggregate([
      {
        // Match messages where the user is either sender or recipient
        $match: {
          $or: [{ sender: userId }, { recipient: userId }],
        },
      },
      {
        // Sort messages by timestamp in descending order (latest first)
        $sort: {
          timestamp: -1,
        },
      },
      {
        // Group messages by the other user involved in the conversation
        $group: {
          _id: {
            // If the current user is sender, group by recipient; otherwise, group by sender
            $cond: {
              if: { $eq: ["$sender", userId] },
              then: "$recipient",
              else: "$sender",
            },
          },
          // Get the timestamp of the most recent message in the group
          lastMessageTime: { $first: "$timestamp" },
        },
      },
      {
        // Look up user details for each contact from the "users" collection
        $lookup: {
          from: "users",
          localField: "_id", // contact ID from the group
          foreignField: "_id", // match with users' _id
          as: "contactInfo",
        },
      },
      {
        // Flatten the contactInfo array into a single object
        $unwind: "$contactInfo",
      },
      {
        // Select and rename the desired fields to return
        $project: {
          _id: 1,
          lastMessageTime: 1,
          email: "$contactInfo.email",
          firstName: "$contactInfo.firstName",
          lastName: "$contactInfo.lastName",
          image: "$contactInfo.image",
          color: "$contactInfo.color",
        },
      },
      {
        // Final sort of contacts by last message time (descending)
        $sort: {
          lastMessageTime: -1,
        },
      },
    ]);

    // Return the final list of contacts in JSON format
    return res.status(200).json({ contacts });
  } catch (error) {
    // Log error and send server error response
    console.log({ error });
    return res.status(500).json({ message: error.message });
  }
};

export const getAllContacts = async (req, res, next) => {
  try {
    const users = await User.find(
      { _id: { $ne: req.user.userId } },
      "firstName lastName _id email"
    );
    const contacts = users.map((user) => ({
      label: user.firstName ? `${user.firstName} ${user.lastName}` : user.email,
    }));
    return res.status(200).json({ contacts });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: error.message });
  }
};
