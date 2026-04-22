import express from "express";
import {
  createOrder,
  getOrderById,
  getStoreOrders,
  getMyOrders,
  updateOrderStatus,
  updatePaymentStatus,
} from "../controller/Order.Controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// Customer
router.post("/create",                        verifyToken, allowRoles("customer", "admin", "super_admin"), createOrder);
router.get("/my_orders",                      verifyToken, allowRoles("customer", "admin", "super_admin"), getMyOrders);

// Admin / Store
router.get("/store/:store_id/all",            verifyToken, allowRoles("admin", "super_admin"), getStoreOrders);
router.patch("/:id/status",                   verifyToken, allowRoles("admin", "super_admin"), updateOrderStatus);
router.patch("/:id/payment",                  verifyToken, allowRoles("admin", "super_admin"), updatePaymentStatus);

// Shared
router.get("/:id",                            verifyToken, allowRoles("admin", "super_admin", "customer"), getOrderById);

export default router;
