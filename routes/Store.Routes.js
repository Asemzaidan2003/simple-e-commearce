import express from "express";
import {
  createStore,
  getAllStores,
  getStoreById,
  updateStore,
  deleteStore,
  getStoreAnalytics,
} from "../controller/Store.Controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/create",            verifyToken, allowRoles("super_admin"), createStore);
router.get("/all",                verifyToken, allowRoles("super_admin"), getAllStores);
router.get("/:id",                verifyToken, allowRoles("admin", "super_admin"), getStoreById);
router.get("/:id/analytics",      verifyToken, allowRoles("admin", "super_admin"), getStoreAnalytics);
router.put("/:id",                verifyToken, allowRoles("admin", "super_admin"), updateStore);
router.delete("/:id",             verifyToken, allowRoles("super_admin"), deleteStore);

export default router;
