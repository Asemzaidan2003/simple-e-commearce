import mongoose from "mongoose";
const storeSchema = mongoose.Schema(
  {
    store_name: {
        type: String,
        required: true
    },
    store_email: {
        type: String,
        required: true
    },
    store_phone_number: {
        type: String
    },
    store_owner_name: {
        type: String,
        required: true
    },
    store_owner_phone_number: {
        type: String,
        required: true
    },
    store_address: {
        type: String,
        required: true
    },
    store_logo_url: {
        type: String
    },
    store_instagram_url: {
        type: String
    },
    store_facebook_url: {
        type: String
    },
    store_x_url: {
        type: String
    },
    store_ticktok_url: {
        type: String
    },
    store_snapshat_url: {
        type: String
    },
    store_subscription_plan: {
        type: String,
        required: true,
        enum: ["free", "basic", "premium"]
    },
    store_subscription_registration_date: {
        type: Date,
        required: true
    },
    store_subscription_expiry_date: {
        type: Date,
        required: true
    },
    store_domain: {
        type: String,
        required: true,
        unique: true,
        index: true
    }
  }
);

const Store = mongoose.model("Store", storeSchema);
export default Store;