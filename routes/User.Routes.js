import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  changePassword,
  deleteUser,
} from "../controller/User.Controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/all",              verifyToken, allowRoles("super_admin", "admin"), getAllUsers);
router.get("/:id",              verifyToken, allowRoles("super_admin", "admin", "customer"), getUserById);
router.put("/:id",              verifyToken, allowRoles("super_admin", "admin", "customer"), updateUser);
router.patch("/change_password",verifyToken, allowRoles("super_admin", "admin", "customer"), changePassword);
router.delete("/:id",           verifyToken, allowRoles("super_admin"), deleteUser);

export default router;
