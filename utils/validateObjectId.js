import mongoose from "mongoose";
import { sendError } from "./apiResponse.js";

/**
 * Middleware factory — validates that a route param is a valid MongoDB ObjectId
 * Usage: router.get("/:id", validateObjectId("id"), myController)
 * @param {string} paramName - The route param name to validate (default: "id")
 */
export const validateObjectId = (paramName = "id") => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, `Invalid ID format for parameter "${paramName}"`);
    }
    next();
  };
};

/**
 * Validates a raw ID string directly (for use inside controllers)
 * @param {string} id
 * @returns {boolean}
 */
export const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
