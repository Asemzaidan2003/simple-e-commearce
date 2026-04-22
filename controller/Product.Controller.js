import Product from "../module/Product.Module.js";
import mongoose from "mongoose";

export const createProduct = async (req, res) => {
  try {
    const {
      store_id,
      product_name_en,
      product_name_ar,
      product_image_url,
      product_description_en,
      product_description_ar,
      product_quantity,
      product_cost,
      product_price,
      product_category,
      product_discount,
    } = req.body;

    if (!store_id || !product_name_en || !product_name_ar || product_quantity == null || product_cost == null || product_price == null) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (product_price < 0 || product_cost < 0 || product_quantity < 0) {
      return res.status(400).json({ message: "Price, cost, and quantity must be non-negative" });
    }

    const product = new Product({
      store_id,
      product_name_en,
      product_name_ar,
      product_image_url,
      product_description_en,
      product_description_ar,
      product_quantity,
      product_cost,
      product_price,
      product_category: product_category || null,
      product_discount: product_discount || null,
    });

    await product.save();
    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Product with this name already exists in this store" });
    }
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const { store_id } = req.params;
    const { page = 1, limit = 20, category, search } = req.query;

    const filter = { store_id, is_deleted: { $ne: true } };
    if (category) filter.product_category = category;
    if (search) {
      filter.$or = [
        { product_name_en: { $regex: search, $options: "i" } },
        { product_name_ar: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("product_category", "category_name_en category_name_ar")
        .populate("product_discount", "discount_code discount_percentage discount_type")
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id)
      .populate("product_category", "category_name_en category_name_ar")
      .populate("product_discount");

    if (!product || product.is_deleted) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.product_price != null && updates.product_price < 0) {
      return res.status(400).json({ message: "Price must be non-negative" });
    }

    const product = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Product name already exists in this store" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, { is_deleted: true }, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getLowStockProducts = async (req, res) => {
  try {
    const { store_id } = req.params;
    const { threshold = 5 } = req.query;
    const products = await Product.find({
      store_id,
      product_quantity: { $lte: parseInt(threshold) },
      is_deleted: { $ne: true },
    }).sort({ product_quantity: 1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
