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
});

const Country = mongoose.model("Country", countrySchema);

export default Country;