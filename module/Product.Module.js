import mongoose from "mongoose";
const productSchema = mongoose.Schema(
    {
        product_name_en:{
            type: String,
            required: true
        },
        product_name_ar:{
            type: String,
            required: true
        },
        product_image_url:{
            type: String
        },
        product_description_en:{
            type: String
        },
        product_description_ar:{
            type: String
        },
        product_quantity:{
            type: Number,
            required: true
        },
        product_cost:{
            type: Number,
            required: true
        },
        product_price:{
            type: Number,
            required: true
        },
        product_category:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
        },
        product_quantity_sold:{
            type: Number,
            default: 0
        },
        product_discount:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Discount",
            default: null
        },
        store_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Store",
            required: true
        },
    },{timestamps: true});
// Indexes
productSchema.index({ store_id: 1 });
productSchema.index({ product_category: 1 });
productSchema.index({ store_id: 1, product_name_en: 1 }, { unique: true });
productSchema.index({ store_id: 1, product_name_ar: 1 }, { unique: true });
const Product = mongoose.model("Product", productSchema);
export default Product;