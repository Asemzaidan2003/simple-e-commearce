import express from "express";
import {
  createCountry,
  getAllCountries,
  getCitiesByCountry,
  createCity,
  deleteCountry,
} from "../controller/Country.Controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/country",                           verifyToken, allowRoles("super_admin"), createCountry);
router.get("/countries",                          verifyToken, getAllCountries);
router.delete("/country/:id",                     verifyToken, allowRoles("super_admin"), deleteCountry);
router.post("/city",                              verifyToken, allowRoles("super_admin"), createCity);
router.get("/country/:country_id/cities",         verifyToken, getCitiesByCountry);

export default router;
