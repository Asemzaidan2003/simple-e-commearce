import Discount from "../module/Discount.Module.js";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid confusion

/**
 * Generates a random discount code string
 * @param {number} length - Length of the random segment (default: 8)
 * @param {string} prefix - Optional prefix e.g. "SUMMER" → "SUMMER-X4K9AB2M"
 * @returns {string}
 */
export const generateCode = (length = 8, prefix = "") => {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return prefix ? `${prefix.toUpperCase()}-${code}` : code;
};

/**
 * Generates a unique discount code that doesn't already exist in the DB for a given store
 * @param {string} store_id
 * @param {string} prefix - Optional prefix
 * @param {number} maxAttempts - Safety limit on retries
 * @returns {Promise<string>}
 */
export const generateUniqueCode = async (store_id, prefix = "", maxAttempts = 10) => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateCode(8, prefix);
    const exists = await Discount.findOne({ discount_code: code, discount_store_id: store_id });
    if (!exists) return code;
  }
  throw new Error("Failed to generate a unique discount code after multiple attempts");
};
