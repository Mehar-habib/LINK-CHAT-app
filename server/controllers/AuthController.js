import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import { compare } from "bcryptjs";
import { renameSync, unlinkSync } from "fs";
import path from "path"; // at the top of the file

// Token max age: 3 days in milliseconds
const maxAge = 3 * 24 * 60 * 60 * 1000;

// Create JWT token
const createToken = (email, userId) => {
  return jwt.sign({ email, userId }, process.env.JWT_SECRET, {
    expiresIn: maxAge,
  });
};

// Signup controller
export const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    // Create user
    const user = await User.create({ email, password });

    // Set JWT cookie
    res.cookie("jwt", createToken(email, user.id), {
      maxAge,
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    // Respond with user data
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User does not exist with this email" });
    }

    // Check if password is correct
    const isPasswordCorrect = await compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Set JWT cookie
    res.cookie("jwt", createToken(email, user.id), {
      maxAge,
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    // Respond with user data
    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        color: user.color,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getUserInfo = async (req, res, next) => {
  try {
    const userData = await User.findById(req.user.userId);
    if (!userData) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({
      user: {
        id: userData.id,
        email: userData.email,
        profileSetup: userData.profileSetup,
        firstName: userData.firstName,
        lastName: userData.lastName,
        image: userData.image,
        color: userData.color,
      },
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { firstName, lastName, color } = req.body;
    if (!firstName || !lastName)
      return res
        .status(400)
        .json({ message: "Please provide firstName, lastName and color" });

    const userData = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        color,
        profileSetup: true,
      },
      { new: true, runValidators: true }
    );
    if (!userData) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      user: {
        id: userData.id,
        email: userData.email,
        profileSetup: userData.profileSetup,
        firstName: userData.firstName,
        lastName: userData.lastName,
        image: userData.image,
        color: userData.color,
      },
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: error.message });
  }
};

export const addProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Please provide a profile image" });
    }

    const date = Date.now();
    let fileName = "uploads/profiles/" + date + req.file.originalname;
    renameSync(req.file.path, fileName);

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      {
        image: fileName,
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      image: updatedUser.image,
    });
  } catch (error) {
    console.error("Image Upload Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const removeProfileImage = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.image) {
      unlinkSync(user.image);
    }
    user.image = null;
    await user.save();
    return res.status(200).json({ message: "Image removed successfully" });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: error.message });
  }
};

export const logout = async (req, res, next) => {
  try {
    res.cookie("jwt", "", { maxAge: 1, secure: true, sameSite: "none" });
    // res.clearCookie("jwt");
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: error.message });
  }
};
