import mongoose from "mongoose";
const categorySchema = mongoose.Schema(
    {
        category_name_en: {
            type: String,
            required: true
        },
        category_name_ar: {
            type: String,
            required: true
        },
        childe_category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: false
        }
    }
);
const Category = mongoose.model("Category", categorySchema);
export default Category;