import User from "../module/user.Module.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "../utils/sendEmail.js";
import {sendError , sendSuccess} from "../utils/responseHandler.js";

// ── Token helpers ─────────────────────────────────────────────────────────────

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.user_role, email: user.user_email },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "30d" }
  );
};

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

// ── Controllers ───────────────────────────────────────────────────────────────

export const registerUser = async (req, res) => {
  try {
    const {
      user_name,
      user_email,
      user_password,
      user_phone_number,
      user_address,
      user_country,
      user_city,
      user_role,
      createdVia,
      created_by,
      updated_by,
    } = req.body;

    if (
      !user_name ||
      !user_email ||
      !user_password ||
      !user_country ||
      !user_city ||
      !user_role ||
      !createdVia
    ) {
      return sendError(res, 400, "Required fields are missing");
    }

    if (user_password.length < 8) {
      return sendError(res, 400, "Password must be at least 8 characters");
    }

    const existingUser = await User.findOne({
      user_email: user_email.toLowerCase(),
    });
    if (existingUser) {
      return sendError(res, 409, "User is already registered");
    }

    const hashedPassword = await bcrypt.hash(user_password, 10);

    const userDoc = new User({
      user_name,
      user_email: user_email.toLowerCase(),
      user_password: hashedPassword,
      user_role,
      user_phone_number,
      user_address,
      user_country,
      user_city,
      createdVia,
      created_by,
      updated_by,
    });

    const accessToken = generateAccessToken(userDoc);
    const refreshToken = generateRefreshToken(userDoc);

    userDoc.refresh_token = refreshToken;
    userDoc.refresh_token_expires_at = new Date(
      Date.now() + REFRESH_TOKEN_TTL_MS,
    );

    await userDoc.save();

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: REFRESH_TOKEN_TTL_MS,
    });

    sendWelcomeEmail(userDoc).catch(console.error);

    res.status(201).json({
      success: true,
      message: "Registered successfully",
      user: {
        id: userDoc._id,
        name: userDoc.user_name,
        email: userDoc.user_email,
        role: userDoc.user_role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { user_email, user_password } = req.body;

    if (!user_email || !user_password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ user_email: user_email.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(user_password, user.user_password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refresh_token = refreshToken;
    user.refresh_token_expires_at = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
    await user.save();

    // 🔥 cookies
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: REFRESH_TOKEN_TTL_MS,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.user_name,
        email: user.user_email,
        role: user.user_role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token" });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const user = await User.findById(decoded.id);

    if (!user || user.refresh_token !== refreshToken) {
      return res.status(401).json({ message: "Refresh token invalid" });
    }

    if (new Date() > user.refresh_token_expires_at) {
      return res.status(401).json({ message: "Session expired" });
    }

    const newAccessToken = generateAccessToken(user);

    res.cookie("access_token", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    user.refresh_token_expires_at = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
    await user.save();

    res.json({ success: true, message: "Token refreshed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal error" });
  }
};

export const logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      refresh_token: null,
      refresh_token_expires_at: null,
    });

    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    res.json({ success: true, message: "Logged out" });
  } catch (error) {
    res.status(500).json({ message: "Internal error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-user_password -refresh_token -refresh_token_expires_at");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
