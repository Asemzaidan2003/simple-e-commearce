import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.listen(port, () => {
  connectDB();
  console.log(`Server Started at port ${port}!!`);
});