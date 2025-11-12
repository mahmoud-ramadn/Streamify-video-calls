import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
export async function signup(req, res) {
  const { email, password, fullName } = req.body;
  try {
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password Must be at least  6 characters" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid Email Address" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists  please use a different One " });
    }

    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    const newUser = await User.create({
      email,
      fullName,
      password,
      profilePic: randomAvatar,
    });

    // ✅ FIX: Ensure the user ID is properly set and converted to string
    const userId = newUser._id?.toString
      ? newUser._id.toString()
      : String(newUser._id);

    if (!userId) {
      console.error("User ID is undefined after creation");
      throw new Error("Failed to create user - no ID generated");
    }

    console.log("Created user ID:", userId);

    try {
      await upsertStreamUser({
        id: userId, // Use the validated userId
        name: newUser.fullName,
        image: newUser.profilePic,
      });
      console.log(`Stream user created for ${newUser.fullName}`);
    } catch (error) {
      console.error("Error Creating Stream user", error);
      // Don't throw here to avoid blocking the signup process
    }

    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.error("Error signing up:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}
export async function login(req, res) {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    // ✅ Ensure Stream user exists or updated
    try {
      await upsertStreamUser({
        id: user._id.toString(),
        name: user.fullName,
        image: user.profilePic,
      });
      console.log(`Stream user synced for ${user.fullName}`);
    } catch (error) {
      console.error("Error syncing Stream user on login:", error);
    }

    // ✅ Create app JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    // ✅ Set cookie
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // ✅ Return response (without res.send below)
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error signing in", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
}

export function logout(req, res) {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
}

export async function onBoarding(req, res) {
  try {
    const userId = req.user._id;
    const { fullName, bio, location, nativeLanguage, learningLanguages } =
      req.body;
    if (
      !fullName ||
      !bio ||
      !location ||
      !nativeLanguage ||
      !learningLanguages
    ) {
      return res.status(400).json({
        message: "All fields are required",
        missingFields: [
          !fullName && "fullName",
          !bio && "bio",
          !location && "location",
          !nativeLanguage && "nativeLanguage",
          !learningLanguages && "learningLanguages",
        ].filter(Boolean),
      });
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...req.body,
        isOnboarded: true,
      },
      { new: true }
    );
    if (!updatedUser)
      return res.status(404).json({ message: "User Not found" });

    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePic || "",
      });
    } catch (streamError) {
      console.log("Error updating Stream user:", streamError.message);
    }

    return res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

