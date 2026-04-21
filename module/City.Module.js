import mongoose from "mongoose";

const citySchema = new mongoose.Schema({
    city_name_ar: {
        type: String,
        required: true,
    },
    city_name_en: {
        type: String,
        required: true,
    },
    country:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Country",
    required: true,
    }
});

const City = mongoose.model("City", citySchema);
export default City;