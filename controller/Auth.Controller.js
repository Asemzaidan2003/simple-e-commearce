import User from "../module/user.Module.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "../utils/sendEmail.js";

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

export const register = async (req, res) => {
  try {
    const { user_name_en, user_email, user_password, user_phone_number, user_address } = req.body;

    if (!user_name_en || !user_email || !user_password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }

    if (user_password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ user_email: user_email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user_password, salt);

    // Generate tokens before saving so we can store the refresh token
    const userDoc = new User({
      user_name_en,
      user_email: user_email.toLowerCase(),
      user_password: hashedPassword,
      user_role: "customer",
      user_phone_number,
      user_address,
    });

    const accessToken  = generateAccessToken(userDoc);
    const refreshToken = generateRefreshToken(userDoc);

    userDoc.refresh_token            = refreshToken;
    userDoc.refresh_token_expires_at = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    await userDoc.save();

    // Send welcome email (non-blocking — don't fail registration if email fails)
    sendWelcomeEmail(userDoc).catch((err) => console.error("Welcome email failed:", err));

    res.status(201).json({
      success: true,
      message: "Registered successfully",
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id:    userDoc._id,
        name:  userDoc.user_name_en,
        email: userDoc.user_email,
        role:  userDoc.user_role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { user_email, user_password } = req.body;

    if (!user_email || !user_password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ user_email: user_email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(user_password, user.user_password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token and reset its expiry (sliding window)
    user.refresh_token            = refreshToken;
    user.refresh_token_expires_at = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Login successful",
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id:    user._id,
        name:  user.user_name_en,
        email: user.user_email,
        role:  user.user_role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const refresh = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(401).json({ success: false, message: "Refresh token is required" });
    }

    // Verify the refresh token signature
    let decoded;
    try {
      decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid or expired refresh token — please log in again" });
    }

    // Make sure this refresh token is the one we issued (not a stolen old one)
    const user = await User.findById(decoded.id);
    if (!user || user.refresh_token !== refresh_token) {
      return res.status(401).json({ success: false, message: "Refresh token is no longer valid — please log in again" });
    }

    // Check DB-level expiry as a second layer
    if (!user.refresh_token_expires_at || new Date() > user.refresh_token_expires_at) {
      return res.status(401).json({ success: false, message: "Session expired — please log in again" });
    }

    // Issue a new access token
    const newAccessToken = generateAccessToken(user);

    // Slide the refresh token expiry window — user stays logged in as long as they're active
    user.refresh_token_expires_at = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
    await user.save();

    res.status(200).json({
      success: true,
      access_token: newAccessToken,
      refresh_token, // same refresh token, expiry just got reset
    });
  } catch (error) {
    console.error("Refresh error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    // Invalidate the refresh token in DB — token is dead even if someone stole it
    await User.findByIdAndUpdate(req.user.id, {
      refresh_token:            null,
      refresh_token_expires_at: null,
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
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
