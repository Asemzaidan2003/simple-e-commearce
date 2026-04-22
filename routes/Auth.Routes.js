import express from "express";
import { register, login, getMe } from "../controller/Auth.Controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login",    login);
router.get("/me",        verifyToken, getMe);

export default router;
