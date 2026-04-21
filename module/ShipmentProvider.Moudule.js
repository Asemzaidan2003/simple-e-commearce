import mongoose from "mongoose";

const shipmentProviderSchema = new mongoose.Schema({
    shipment_provider_name: {
        type: String,
        required: true,
    },
});

const ShipmentProvider = mongoose.model("ShipmentProvider", shipmentProviderSchema);

export default ShipmentProvider;