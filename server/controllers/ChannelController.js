import mongoose from "mongoose";
import Channel from "../models/Channel.js";
import User from "../models/UserModel.js";

export const createChannel = async (req, res, next) => {
  try {
    // Destructure name and members array from request body
    const { name, members } = req.body;

    // Get the currently logged-in user's ID from the auth middleware
    const userId = req.user.userId;

    // Find the admin user in the database
    const admin = await User.findById(userId);

    // If admin user not found, return 404 error
    if (!admin) {
      return res.status(404).json({ message: "Admin User not found" });
    }

    // Validate that all provided member IDs exist in the database
    const validMembers = await User.find({ _id: { $in: members } });

    // If some members are invalid, return a 400 error
    if (validMembers.length !== members.length) {
      return res.status(400).json({ message: "Invalid members" });
    }

    // Create a new channel instance
    const newChannel = new Channel({
      name, // Channel name
      members, // Validated members list
      admin: userId, // Creator of the channel is set as admin
    });

    // Save the new channel to the database
    await newChannel.save();

    // Respond with the newly created channel
    return res.status(200).json({ Channel: newChannel });
  } catch (error) {
    // Log and return server error
    console.log({ error });
    return res.status(500).json({ message: error.message });
  }
};

export const getUserChannels = async (req, res, next) => {
  try {
    // Convert the user's ID from the request to a MongoDB ObjectId
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    // Find all channels where the user is either an admin or a member
    const channels = await Channel.find({
      $or: [{ admin: userId }, { members: userId }],
    }).sort({ updatedAt: -1 }); // Sort channels by most recently updated

    // Return the list of channels to the client
    return res.status(200).json({ channels });
  } catch (error) {
    // Log and return server error if anything goes wrong
    console.log({ error });
    return res.status(500).json({ message: error.message });
  }
};
