import City from "../module/City.Module.js";

export const getCitiesByCountry = async (req, res) => {
  try {
    const cities = await City.find({ country: req.params.country_id }).sort({
      city_name_en: 1,
    });
    res.status(200).json(cities);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createCity = async (req, res) => {
  try {
    const { city_name_en, city_name_ar, country , user_id} = req.body;
    if (!city_name_en || !city_name_ar || !country || !user_id) {
      return res.status(400).json({ message: "Required fields are missing" });
    }
    const city = new City({
      city_name_en,
      city_name_ar,
      country,
      created_by: user_id,
      updated_by: user_id,
    });
    await city.save();
    res.status(201).json({ message: "City created", city });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteCity = async (req, res) => {
  try {
    const {id} = req.params;
    const {user_id} = req.body;
    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const city = await City.findByIdAndUpdate(id, { is_deleted: true, updated_by: user_id }, { new: true });
    if (!city) return res.status(404).json({ message: "City not found" });
    res.status(200).json({ message: "City deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateCity = async (req, res) => {
  try {
    const { id } = req.params;
    const { city_name_en, city_name_ar, country , user_id} = req.body;
    const city = await City.findByIdAndUpdate(
        id,
        { city_name_en, city_name_ar, country , updated_by: user_id },
        { new: true }
    );
    if (!city) return res.status(404).json({ message: "City not found" });
    res.status(200).json({ message: "City updated", city });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};