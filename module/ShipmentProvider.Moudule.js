import mongoose from "mongoose";

const shipmentProviderSchema = new mongoose.Schema({
    shipment_provider_name: {
        type: String,
        required: true,
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    updated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    is_deleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true}
);

const ShipmentProvider = mongoose.model("ShipmentProvider", shipmentProviderSchema);

export default ShipmentProvider;