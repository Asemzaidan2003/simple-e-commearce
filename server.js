import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import categoryRoutes from "./routes/Category.Routs.js";
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.listen(port, () => {
  connectDB();
  console.log(`Server Started at port ${port}!!`);
});

app.use("/api/category", categoryRoutes);