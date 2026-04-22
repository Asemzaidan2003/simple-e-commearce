import multer from "multer";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_MB   = 5;

const storage = multer.memoryStorage(); // keep file in memory as Buffer → pass to Cloudinary

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and WebP images are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
});

export const uploadSingle = upload.single("image");   // for product/store single image
export const uploadMultiple = upload.array("images", 5); // up to 5 images if needed
