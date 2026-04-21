import Category from "../module/Category.Module.js";
import mongoose from "mongoose";

export const createCategory = async (req, res) => {
  try {
    const { store_id, category_name_en, category_name_ar, parent_category } =
      req.body;

    const category = new Category({
        store_id,
        category_name_en,
        category_name_ar,
        parent_category: parent_category || null,
    });
    await category.save();
    res.status(201).json(category);//This to be changed later
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//This function will get all categories for a specific store, including the deleted and inactive categories, this is to be used in the admin panel to manage the categories, while in the user panel we will only show the active and not deleted categories
export const getAllCategories = async (req, res) => {
  try {
    const { store_id } = req.params;
    const categories = await Category.find({ store_id });
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//This function will get all active categories for a specific store, this is to be used in the user panel to show only the active categories
export const getActiveCategories = async (req, res) => {
    try {
        const { store_id } = req.params;
        const categories = await Category.find({
            store_id,
            is_deleted: { $ne: true },
            category_status: "active"
        });
        res.status(200).json(categories);
    } catch (error) {
        console.error("Error fetching active categories:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

//This function will get all categories for a specific store, to the store admin
export const getCategories = async (req, res) => {
  try {
    const { store_id } = req.params;
    const categories = await Category.find({
      store_id,
      is_deleted: { $ne: true }
    });
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching active categories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name_en, category_name_ar, parent_category , category_status, is_deleted } = req.body;
    const category = await Category.findByIdAndUpdate(
      id,
      { category_name_en, category_name_ar, parent_category, category_status, is_deleted },
        { new: true },
    );
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }   
    res.status(200).json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByIdAndUpdate(
            id,
            { is_deleted: true },
            { new: true },
        );
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
