import Product from "../models/Product.Model.js";

// final layer of validation for order items
export const validateOrderItem = async (item) => {
    const product = await Product.findById(item.product_id);
      if (!product || product.is_deleted) {
        throw new Error(`Product ${item.product_id} not found`);
      }
      if (product.product_quantity < item.quantity) {
        throw new Error(`Insufficient stock for product "${product.product_name_en}". Available: ${product.product_quantity}`);
      }
    }