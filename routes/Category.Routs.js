import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategories,
  getCategoryById,
  getActiveCategories,
  updateCategory,
  deleteCategory,
} from "../controller/Category.Controller.js";

import { verifyToken } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

/**
 * ADMIN ONLY
 */
router.post(
  "/create_category",
  verifyToken,
  allowRoles("admin"),
  createCategory,
);

router.get(
  "/admin/:store_id/all_categories",
  verifyToken,
  allowRoles("admin"),
  getAllCategories,
);

/**
 * STORE USER
 */
router.get(
  "/store/:store_id/active_categories",
  verifyToken,
  allowRoles("store", "admin" ,"customer"),
  getActiveCategories,
);

router.get(
  "/store/:store_id/categories",
  verifyToken,
  allowRoles("store", "admin"),
  getCategories,
);

/**
 * SHARED
 */
router.get("/:id", verifyToken, allowRoles("admin", "store"), getCategoryById);

router.put("/:id", verifyToken, allowRoles("admin" , "store"), updateCategory);

router.put("/:id", verifyToken, allowRoles("admin","store"), deleteCategory);

export default router;
