import Discount from "../module/Discount.Module.js";

/**
 * Validates and applies a discount code to a subtotal
 * @param {string} discount_code
 * @param {string} store_id
 * @param {number} subtotal
 * @returns {{ discount_amount, appliedCode, discountDoc }}
 */
export const applyDiscount = async (discount_code, store_id, subtotal) => {
  if (!discount_code) return { discount_amount: 0, appliedCode: null, discountDoc: null };

  const discount = await Discount.findOne({
    discount_code:     discount_code.toUpperCase(),
    discount_store_id: store_id,
    discount_status:   "active",
  });

  if (!discount) throw { status: 400, message: "Invalid or inactive discount code" };

  if (discount.discount_end_date && new Date() > discount.discount_end_date) {
    throw { status: 400, message: "Discount code has expired" };
  }

  if (discount.discount_max_usage && discount.discount_used_count >= discount.discount_max_usage) {
    throw { status: 400, message: "Discount code usage limit reached" };
  }

  if (subtotal < discount.discount_min_order) {
    throw {
      status: 400,
      message: `Minimum order amount for this discount is ${discount.discount_min_order}`,
    };
  }

  const discount_amount =
    discount.discount_type === "percentage"
      ? parseFloat(((subtotal * discount.discount_percentage) / 100).toFixed(2))
      : discount.discount_percentage; // fixed_amount stores value in discount_percentage field

  return {
    discount_amount,
    appliedCode: discount.discount_code,
    discountDoc: discount,
  };
};

/**
 * Calculates full order pricing breakdown
 * @param {array}  items        - [{ product_price, quantity }]
 * @param {number} shipping_fee
 * @param {string} discount_code
 * @param {string} store_id
 * @returns {object} pricing breakdown
 */
export const calculateOrderPricing = async (items, shipping_fee = 0, discount_code = null, store_id = null) => {
  const subtotal = items.reduce((acc, item) => {
    return acc + parseFloat((item.product_price * item.quantity).toFixed(2));
  }, 0);

  const { discount_amount, appliedCode, discountDoc } = await applyDiscount(discount_code, store_id, subtotal);

  const total = parseFloat((subtotal - discount_amount + shipping_fee).toFixed(2));

  return {
    subtotal:        parseFloat(subtotal.toFixed(2)),
    shipping_fee:    parseFloat(shipping_fee.toFixed(2)),
    discount_code:   appliedCode,
    discount_amount: parseFloat(discount_amount.toFixed(2)),
    total,
    discountDoc, // returned so the controller can increment discount_used_count
  };
};

/**
 * Calculates analytics fields for an order
 * @param {array}  enrichedItems - [{ product_cost, product_price, quantity }]
 * @param {number} total         - Final order total
 * @returns {{ total_cost, total_items, total_profit }}
 */
export const calculateOrderAnalytics = (enrichedItems, total) => {
  const total_cost  = enrichedItems.reduce((acc, item) => acc + item.product_cost * item.quantity, 0);
  const total_items = enrichedItems.reduce((acc, item) => acc + item.quantity, 0);
  const total_profit = parseFloat((total - total_cost).toFixed(2));

  return {
    total_cost:   parseFloat(total_cost.toFixed(2)),
    total_items,
    total_profit,
  };
};
