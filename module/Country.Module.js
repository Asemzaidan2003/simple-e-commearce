import mongoose from "mongoose";

const countrySchema = new mongoose.Schema({
    country_name_ar: {
        type: String,
        required: true,
    },
    country_name_en: {
        type: String,
        required: true,
    },
    creared_by: {
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
}, { timestamps: true
});

const Country = mongoose.model("Country", countrySchema);

export default Country;