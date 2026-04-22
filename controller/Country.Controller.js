import Country from "../module/Country.Module.js";
import City from "../module/City.Module.js";

export const createCountry = async (req, res) => {
  try {
    const country = new Country(req.body);
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

export const getCitiesByCountry = async (req, res) => {
  try {
    const cities = await City.find({ country: req.params.country_id }).sort({ city_name_en: 1 });
    res.status(200).json(cities);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createCity = async (req, res) => {
  try {
    const city = new City(req.body);
    await city.save();
    res.status(201).json({ message: "City created", city });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteCountry = async (req, res) => {
  try {
    const country = await Country.findByIdAndDelete(req.params.id);
    if (!country) return res.status(404).json({ message: "Country not found" });
    // Also delete related cities
    await City.deleteMany({ country: req.params.id });
    res.status(200).json({ message: "Country and its cities deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
