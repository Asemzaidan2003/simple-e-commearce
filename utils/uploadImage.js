import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// Cloudinary is configured from .env — call this once at app startup (already done via dotenv.config())
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer to Cloudinary
 * @param {Buffer} fileBuffer   - The raw file buffer (from multer memoryStorage)
 * @param {string} folder       - Cloudinary folder e.g. "products", "store-logos"
 * @param {string} publicId     - Optional custom filename (without extension)
 * @returns {Promise<{ url, public_id }>}
 */
export const uploadImage = (fileBuffer, folder = "uploads", publicId = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      folder,
      resource_type: "image",
      transformation: [{ quality: "auto", fetch_format: "auto" }], // auto-optimize
    };
    if (publicId) options.public_id = publicId;

    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve({ url: result.secure_url, public_id: result.public_id });
    });

    // Convert buffer to a readable stream and pipe into Cloudinary
    const readable = new Readable();
    readable.push(fileBuffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

/**
 * Deletes an image from Cloudinary by its public_id
 * Call this when a product or store is deleted, or when image is replaced
 * @param {string} publicId
 * @returns {Promise}
 */
export const deleteImage = async (publicId) => {
  if (!publicId) return null;
  return cloudinary.uploader.destroy(publicId);
};

/**
 * Replaces an existing image: deletes the old one and uploads the new one
 * @param {Buffer} newFileBuffer
 * @param {string} oldPublicId   - The existing image's public_id to delete
 * @param {string} folder
 * @returns {Promise<{ url, public_id }>}
 */
export const replaceImage = async (newFileBuffer, oldPublicId, folder = "uploads") => {
  await deleteImage(oldPublicId);
  return uploadImage(newFileBuffer, folder);
};
