import Order from "../module/Order.Module.js";
import Product from "../module/Product.Module.js";
import Discount from "../module/Discount.Module.js";

export const createOrder = async (req, res) => {
  try {
    const {
      store_id,
      items,
      payment,
      shipment,
      discount_code,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order must have at least one item" });
    }

    // Validate and build items, check stock
    let subtotal = 0;
    const enrichedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product_id);
      if (!product || product.is_deleted) {
        return res.status(404).json({ message: `Product ${item.product_id} not found` });
      }
      if (product.product_quantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product "${product.product_name_en}". Available: ${product.product_quantity}`,
        });
      }
      subtotal += product.product_price * item.quantity;
      enrichedItems.push({
        product_id: product._id,
        product_name: product.product_name_en,
        product_price: product.product_price,
        quantity: item.quantity,
      });
    }

    // Apply discount code
    let discount_amount = 0;
    let appliedDiscountCode = null;
    if (discount_code) {
      const discount = await Discount.findOne({
        discount_code: discount_code.toUpperCase(),
        discount_store_id: store_id,
        discount_status: "active",
      });

      if (!discount) {
        return res.status(400).json({ message: "Invalid or expired discount code" });
      }
      if (discount.discount_end_date && new Date() > discount.discount_end_date) {
        return res.status(400).json({ message: "Discount code has expired" });
      }
      if (discount.discount_max_usage && discount.discount_used_count >= discount.discount_max_usage) {
        return res.status(400).json({ message: "Discount code usage limit reached" });
      }
      if (subtotal < discount.discount_min_order) {
        return res.status(400).json({
          message: `Minimum order amount for this discount is ${discount.discount_min_order}`,
        });
      }

      if (discount.discount_type === "percentage") {
        discount_amount = (subtotal * discount.discount_percentage) / 100;
      } else {
        discount_amount = discount.discount_percentage; // fixed amount stored here
      }

      appliedDiscountCode = discount.discount_code;
      discount.discount_used_count += 1;
      await discount.save();
    }

    const shipping_fee = shipment?.shipping_fee || 0;
    const total = subtotal - discount_amount + shipping_fee;

    // Calculate analytics
    let total_cost = 0;
    for (const item of enrichedItems) {
      const product = await Product.findById(item.product_id);
      total_cost += product.product_cost * item.quantity;
    }

    const order = new Order({
      user: req.user.id,
      store_id,
      items: enrichedItems,
      pricing: {
        subtotal,
        shipping_fee,
        discount_code: appliedDiscountCode,
        discount_amount,
        total,
      },
      payment: {
        method: payment.method,
        status: "pending",
      },
      shipment: {
        shipment_provider: shipment?.shipment_provider || null,
        shipment_method: shipment?.shipment_method || "standard",
        shipping_address: shipment?.shipping_address || {},
      },
      analytics: {
        total_cost,
        total_items: enrichedItems.reduce((acc, i) => acc + i.quantity, 0),
        total_profit: total - total_cost,
        source: shipment?.source || "website",
      },
    });

    await order.save();

    // Deduct stock
    for (const item of enrichedItems) {
      await Product.findByIdAndUpdate(item.product_id, {
        $inc: { product_quantity: -item.quantity, product_quantity_sold: item.quantity },
      });
    }

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate("user", "user_name_en user_email user_phone_number")
      .populate("items.product_id", "product_name_en product_image_url")
      .populate("shipment.shipping_address.country", "country_name_en")
      .populate("shipment.shipping_address.city", "city_name_en");

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Customers can only see their own orders
    if (req.user.role === "customer" && order.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getStoreOrders = async (req, res) => {
  try {
    const { store_id } = req.params;
    const { page = 1, limit = 20, status, payment_status } = req.query;

    const filter = { store_id };
    if (status) filter.status = status;
    if (payment_status) filter["payment.status"] = payment_status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("user", "user_name_en user_email")
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({
      orders,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.product_id", "product_name_en product_image_url")
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, cancelled_reason } = req.body;

    const validStatuses = ["pending", "processing", "Ready_for_Shipment", "Ready_for_Pickup", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const update = { status };
    if (status === "cancelled" && cancelled_reason) {
      update.cancelled_reason = cancelled_reason;
    }

    const order = await Order.findByIdAndUpdate(id, update, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Restore stock if cancelled
    if (status === "cancelled") {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product_id, {
          $inc: { product_quantity: item.quantity, product_quantity_sold: -item.quantity },
        });
      }
    }

    res.status(200).json({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, transaction_id } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      {
        "payment.status": status,
        "payment.transaction_id": transaction_id,
        "payment.paid_at": status === "paid" ? new Date() : undefined,
      },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: "Payment status updated", order });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
