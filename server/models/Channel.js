import mongoose from "mongoose";

// Define the schema for a channel (group chat or similar)
const channelSchema = new mongoose.Schema({
  // Name of the channel (e.g., group name)
  name: {
    type: String,
    required: true,
  },

  // Array of members in the channel, each referencing a User document
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],

  // Admin of the channel (typically the creator), also a User reference
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Messages associated with the channel, referencing the Messages collection
  messages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Messages",
      required: false,
    },
  ],

  // When the channel was created
  createdAt: {
    type: Date,
    default: Date.now(),
  },

  // When the channel was last updated
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

// Middleware to automatically update `updatedAt` before saving
channelSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Middleware to update `updatedAt` before executing a findOneAndUpdate operation
channelSchema.pre("findOneAndUpdate", function (next) {
  this.set("updatedAt", Date.now());
  next();
});

// Create the model from the schema
const Channel = mongoose.model("Channels", channelSchema);

// Export the model for use in other parts of the application
export default Channel;
