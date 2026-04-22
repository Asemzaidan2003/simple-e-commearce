import express from "express";
import {
  createDiscount,
  getAllDiscounts,
  getDiscountById,
  validateDiscountCode,
  updateDiscount,
  deleteDiscount,
} from "../controller/Discount.Controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/create",                        verifyToken, allowRoles("admin", "super_admin"), createDiscount);
router.post("/validate",                      verifyToken, allowRoles("admin", "super_admin", "customer"), validateDiscountCode);
router.get("/store/:store_id/all",            verifyToken, allowRoles("admin", "super_admin"), getAllDiscounts);
router.get("/:id",                            verifyToken, allowRoles("admin", "super_admin"), getDiscountById);
router.put("/:id",                            verifyToken, allowRoles("admin", "super_admin"), updateDiscount);
router.delete("/:id",                         verifyToken, allowRoles("admin", "super_admin"), deleteDiscount);

export default router;
