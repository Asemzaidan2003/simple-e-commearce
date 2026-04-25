import User from "../module/user.Module.js";
import bcrypt from "bcryptjs";


export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-user_password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-user_password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { user_name, user_email, user_phone_number, user_address } = req.body;

    // Non-admins can only update their own profile
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      if (req.params.id !== req.user.id) {
        return res.status(403).json({ message: "You can only update your own profile" });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { user_name_en, user_email, user_phone_number, user_address },
      { new: true, runValidators: true }
    ).select("-user_password");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User updated", user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(current_password, user.user_password);
    if (!isMatch) return res.status(401).json({ message: "Current password is incorrect" });

    if (new_password.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const salt = await bcrypt.genSalt(10);
    user.user_password = await bcrypt.hash(new_password, salt);
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
