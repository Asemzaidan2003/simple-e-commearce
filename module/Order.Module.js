import mongoose from "mongoose";
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    store_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },

    items: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        product_name: String,
        product_price: Number,
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],

    pricing: {
      subtotal: {
        type: Number,
        required: true,
      },
      shipping_fee: {
        type: Number,
        default: 0,
      },
      discount_code: {
        type: String,
        default: null,
      },
      discount_amount: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        required: true,
      },
    },

    payment: {
      method: {
        type: String,
        enum: ["credit_card", "paypal", "cash_on_delivery"],
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
      },
      transaction_id: String,
      paid_at: Date,
    },
    shipment:{
      shipment_provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ShipmentProvider",
        enum: ["dhl", "fedex", "ups", "local_courier"],
      },
      shipment_method: {
        type: String,
        enum: ["standard", "express", "pickup"],
        required: true,
      },
      shipping_address: {
        country: { type: mongoose.Schema.Types.ObjectId, ref: "Country" },
        city: { type: mongoose.Schema.Types.ObjectId, ref: "City" },
        street_address: String,
        notes: String,
      },
    },
    
    analytics: {
      total_cost: {
        type: Number,
        required: true,
      },
      total_items: {
        type: Number,
        required: true,
      },
      total_profit: {
        type: Number,
        required: true,
      },
      source: {
        //This will be determined later
        type: String,
        enum: ["website", "instagram", "whatsapp", "third_party"],
      },
    },

    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "Ready_for_Shipment",
        "Ready_for_Pickup",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
      status_history: [
        {
          status: String,
          at: Date,
        },
      ],
    },

    cancelled_reason: {
      type: String,
    },
  },
  { timestamps: true },
);

orderSchema.index({ store_id: 1, createdAt: -1 });
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ "payment.status": 1 });
const Order = mongoose.model("Order", orderSchema);
export default Order;