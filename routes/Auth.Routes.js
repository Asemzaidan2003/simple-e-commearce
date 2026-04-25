import express from "express";
import { registerUser, login, refresh, logout, getMe } from "../controller/Auth.Controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login",    login);
router.post("/refresh",  refresh);        // get new access token using refresh token
router.post("/logout",   verifyToken, logout);  // invalidates refresh token in DB
router.get("/me",        verifyToken, getMe);

export default router;
