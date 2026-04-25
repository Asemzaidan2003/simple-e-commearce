import express from "express";
import {
  createDiscount,
  getAllDiscountsByStoreId,
  getDiscountById,
  validateDiscountCode,
  updateDiscount,
  deleteDiscount,
} from "../controller/Discount.Controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/create",verifyToken, allowRoles("admin", "super_admin","store"), createDiscount);
router.post("/validate",verifyToken, validateDiscountCode);
router.get("/store/:store_id/all",verifyToken, allowRoles("admin", "super_admin" ,"store"), getAllDiscountsByStoreId);
router.get("/:id",verifyToken, getDiscountById);
router.put("/:id",verifyToken, allowRoles("admin", "super_admin" , "store"), updateDiscount);
router.put("/:id",verifyToken, allowRoles("admin", "super_admin"), deleteDiscount);

export default router;
