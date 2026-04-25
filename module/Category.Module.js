import mongoose from "mongoose";
const categorySchema = new mongoose.Schema(
  {
    store_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },

    category_name_en: {
      type: String,
      required: true,
    },

    category_name_ar: {
      type: String,
      required: true,
    },

    parent_category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    category_status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    is_deleted:{
      type: Boolean,
      default: false,  
    },
    creared_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

// Indexes
categorySchema.index({ store_id: 1 });
categorySchema.index({ store_id: 1, parent_category: 1 });
categorySchema.index({ store_id: 1, category_name_en: 1 }, { unique: true });
categorySchema.index({ store_id: 1, category_name_ar: 1 }, { unique: true });

const Category = mongoose.model("Category", categorySchema);
export default Category;