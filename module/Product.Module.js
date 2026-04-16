import mongoose from "mongoose";
const categorySchema = mongoose.Schema(
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
        }
    });

const Product = mongoose.model("Product", categorySchema);
export default Product;