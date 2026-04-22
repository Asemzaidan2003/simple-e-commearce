import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

import authRoutes     from "./routes/Auth.Routes.js";
import categoryRoutes from "./routes/Category.Routs.js";
import productRoutes  from "./routes/Product.Routes.js";
import orderRoutes    from "./routes/Order.Routes.js";
import discountRoutes from "./routes/Discount.Routes.js";
import storeRoutes    from "./routes/Store.Routes.js";
import userRoutes     from "./routes/User.Routes.js";
import countryRoutes  from "./routes/Country.Routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/auth",     authRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/product",  productRoutes);
app.use("/api/order",    orderRoutes);
app.use("/api/discount", discountRoutes);
app.use("/api/store",    storeRoutes);
app.use("/api/user",     userRoutes);
app.use("/api/location", countryRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

app.listen(port, async () => {
  await connectDB();
  console.log(`Server started at port ${port}`);
});
