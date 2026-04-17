import mongoose from "mongoose";
const discountSchema = mongoose.Schema({
  discount_name_en: {
    type: String,
    required: true,
  },
  discount_name_ar: {
    type: String,
    required: true,
  },
  discount_code: {
    type: String,
    unique: true,
    uppercase: true,
    trim: true,
  },
  discount_percentage: {
    type: Number,
    required: true,
  },
  discount_type: {
    type: String,
    required: true,
    enum: ["percentage", "fixed_amount"],
  },
  discount_start_date: {
    type: Date,
    required: true,
  },
  discount_end_date: {
    type: Date,
  },
  discount_status: {
    type: String,
    required: true,
    enum: ["active", "inactive"],
  },
  discount_max_usage: {
    type: Number,
  },
  discount_used_count: {
    type: Number,
    default: 0,
  },
  discount_min_order: {
    type: Number,
    default: 0,
  },
});
const Discount = mongoose.model("Discount", discountSchema);
export default Discount;