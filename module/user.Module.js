import mongoose from "mongoose";
import { use } from "react";

const userSchema = mongoose.Schema(
  {
    user_name: {
      type: String,
      required: true,
    },
    user_email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    user_password: {
      type: String,
      required: true,
    },
    user_role: {
      type: String,
      required: true,
      enum: ["super_admin", "admin", "customer", "store"],
      default: "customer",
    },
    user_address: {
      type: String,
    },
    user_country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: true,
    },
    user_city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: true,
    },
    user_phone_number: {
      type: String,
    },
    // Refresh token support
    refresh_token: {
      type: String,
      default: null,
    },
    refresh_token_expires_at: {
      type: Date,
      default: null,
    },
    createdVia: {
      type: String,
      enum: ["self", "admin", "system", "import"],
      required: true,
      default: "self",
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      nullable: true,
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      nullable: true,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
export default User;
