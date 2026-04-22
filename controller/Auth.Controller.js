import User from "../module/user.Module.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { user_name_en, user_email, user_password, user_phone_number, user_address } = req.body;

    if (!user_name_en || !user_email || !user_password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existingUser = await User.findOne({ user_email: user_email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user_password, salt);

    const user = new User({
      user_name_en,
      user_email: user_email.toLowerCase(),
      user_password: hashedPassword,
      user_role: "customer",
      user_phone_number,
      user_address,
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.user_role, email: user.user_email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.user_name_en,
        email: user.user_email,
        role: user.user_role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { user_email, user_password } = req.body;

    if (!user_email || !user_password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ user_email: user_email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(user_password, user.user_password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.user_role, email: user.user_email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.user_name_en,
        email: user.user_email,
        role: user.user_role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-user_password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
