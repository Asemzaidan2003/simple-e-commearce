import Category from "../module/Category.Module.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import mongoose from "mongoose";

export const createCategory = async (req, res) => {
  try {
    const { store_id, category_name_en, category_name_ar, parent_category ,user_id } =
      req.body;

    const category = new Category({
      store_id,
      category_name_en,
      category_name_ar,
      parent_category: parent_category || null,
      created_by: user_id,
      updated_by: user_id,
    });

    await category.save();

    return sendSuccess(res, 201, "Category created successfully", category);
  } catch (error) {
    console.error("Error creating category:", error);
    return sendError(res, 500, "Internal server error", error);
  }
};

//This function will get all categories for a specific store, including the deleted and inactive categories, this is to be used in the admin panel to manage the categories, while in the user panel we will only show the active and not deleted categories
export const getAllCategories = async (req, res) => {
  try {
    const { store_id } = req.params;
    const categories = await Category.find({ store_id });

    return sendSuccess(res, 200, "Categories fetched successfully", categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return sendError(res, 500, "Internal server error", error);
  }
};

//This function will get all active categories for a specific store, this is to be used in the user panel to show only the active categories
export const getActiveCategories = async (req, res) => {
  try {
    const { store_id } = req.params;
    const categories = await Category.find({
      store_id,
      is_deleted: { $ne: true },
      category_status: "active",
    });

    return sendSuccess(
      res,
      200,
      "Active categories fetched successfully",
      categories
    );
  } catch (error) {
    console.error("Error fetching active categories:", error);
    return sendError(res, 500, "Internal server error", error);
  }
};

//This function will get all categories for a specific store, to the store admin
export const getCategories = async (req, res) => {
  try {
    const { store_id } = req.params;
    const categories = await Category.find({
      store_id,
      is_deleted: { $ne: true },
    });

    return sendSuccess(res, 200, "Categories fetched successfully", categories);
  } catch (error) {
    console.error("Error fetching active categories:", error);
    return sendError(res, 500, "Internal server error", error);
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return sendError(res, 404, "Category not found");
    }

    return sendSuccess(
      res,
      200,
      "Category fetched successfully",
      category
    );
  } catch (error) {
    console.error("Error fetching category:", error);
    return sendError(res, 500, "Internal server error", error);
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      user_id,
      category_name_en,
      category_name_ar,
      parent_category,
      category_status,
    } = req.body;

    const category = await Category.findByIdAndUpdate(
      id,
      {
        category_name_en,
        category_name_ar,
        parent_category,
        category_status,
        updated_by: user_id,
      },
      { new: true },
    );

    if (!category) {
      return sendError(res, 404, "Category not found");
    }

    return sendSuccess(
      res,
      200,
      "Category updated successfully",
      category
    );
  } catch (error) {
    console.error("Error updating category:", error);
    return sendError(res, 500, "Internal server error", error);
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndUpdate(
      id,
      { is_deleted: true,
        updated_by: req.body.user_id
       },
      { new: true }
    );

    if (!category) {
      return sendError(res, 404, "Category not found");
    }

    return sendSuccess(
      res,
      200,
      "Category deleted successfully",
      category
    );
  } catch (error) {
    console.error("Error deleting category:", error);
    return sendError(res, 500, "Internal server error", error);
  }
};