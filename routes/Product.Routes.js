import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
} from "../controller/Product.Controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/create",                        verifyToken, allowRoles("admin", "super_admin"), createProduct);
router.get("/store/:store_id/all",            verifyToken, allowRoles("admin", "super_admin"), getAllProducts);
router.get("/store/:store_id/low_stock",      verifyToken, allowRoles("admin", "super_admin"), getLowStockProducts);
router.get("/:id",                            verifyToken, allowRoles("admin", "super_admin", "customer"), getProductById);
router.put("/:id",                            verifyToken, allowRoles("admin", "super_admin"), updateProduct);
router.delete("/:id",                         verifyToken, allowRoles("admin", "super_admin"), deleteProduct);

export default router;
