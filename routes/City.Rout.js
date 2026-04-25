import {
  getCitiesByCountry,
  createCity,
  updateCity,
  deleteCity,
} from "../controller/City.Controller";

import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/country/:country_id/cities", verifyToken, getCitiesByCountry);
router.post("/city", verifyToken, allowRoles("super_admin" , "admin"), createCity);
router.put("/city/:id", verifyToken, allowRoles("super_admin" , "admin"), updateCity);
router.put("/city/:id", verifyToken, allowRoles("super_admin"), deleteCity);