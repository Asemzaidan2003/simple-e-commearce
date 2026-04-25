import Country from "../module/Country.Module.js";


export const createCountry = async (req, res) => {
  try {
    const { country_name_en, country_name_ar, user_id } = req.body;
    if (!country_name_en || !country_name_ar || !user_id) {
      return res.status(400).json({ message: "Required fields are missing" });
    }
    const country = new Country({
      country_name_en,
      country_name_ar,
      created_by: user_id,
      updated_by: user_id,
    });
    await country.save();
    res.status(201).json({ message: "Country created", country });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllCountries = async (req, res) => {
  try {
    const countries = await Country.find().sort({ country_name_en: 1 });
    res.status(200).json(countries);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteCountry = async (req, res) => {
  try {
    const {id} = req.params;
    const { user_id } = req.body;
    const country = await Country.findByIdAndUpdate(id , { is_deleted: true, updated_by: user_id }, { new: true });
    if (!country) return res.status(404).json({ message: "Country not found" });
    // Also delete related cities
    await City.updateMany({ country: id }, { is_deleted: true, updated_by: user_id });
    res.status(200).json({ message: "Country and its cities deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
