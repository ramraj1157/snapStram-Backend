import bcrypt from "bcrypt";
import { Request, Response } from "express";
import User from "../models/user.model";
import uploadImage from "../utils/uploadImage";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userName, name, email, password } = req.body;

    if (!userName || !name || !email || !password) {
      res.status(400).json({ success: false, message: "Please enter all fields" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
      return;
    }

    if (await User.findOne({ userName })) {
      res.status(409).json({ success: false, message: "Username already exists" });
      return;
    }

    if (await User.findOne({ email })) {
      res.status(409).json({ success: false, message: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    


    const newUser = new User({ userName, name, email, password: hashedPassword });
    await newUser.save();
    console.log("Entered Password:", password);
    console.log("Stored Hashed Password:", newUser?.password);

    res.status(201).json({ success: true, message: "User registered successfully", user:newUser });
  } catch (err) {
    console.error("Error in register:", err);
    res.status(500).json({ success: false, message: "Error registering user" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userName, password } = req.body;

    if (!userName || !password) {
      res.status(400).json({ success: false, message: "Please enter all fields" });
      return;
    }

    const user = await User.findOne({ userName });

    if (!user) {
      res.status(401).json({ success: false, message: "User not found" });
      return;
    }

    if (!user.password) {
      res.status(500).json({ success: false, message: "User password is missing in the database." });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Incorrect credentials" });
      return;
    }

    res.status(200).json({ success: true, message: `Welcome back, ${user.name}`, user });
  } catch (err) {
    console.error("Error in login:", err);
    res.status(500).json({ success: false, message: "Error logging in" });
  }
};


export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password || password.length < 6) {
      res.status(400).json({ success: false, message: "Invalid input" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error resetting password" });
  }
};

export const checkUserName = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userName } = req.body;
    if (await User.findOne({ userName })) {
      res.status(409).json({ success: false, message: "Username already exists" });
    } else {
      res.status(200).json({ success: true, message: "Username available" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Error checking username" });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, userName } = req.body;
    const user = await User.findOne({ userName });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (req.file) {
      user.userProfile = await uploadImage(req.file) || user.userProfile;
    }

    if (name) user.name = name || user.name;

    if (userName) user.userName = userName || user.userName;
    await user.save();

    res.status(200).json({ success: true, message: "Profile updated successfully", user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Error updating profile" });
  }
};
