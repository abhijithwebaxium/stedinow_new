import Country from '../models/country.js';

// Get all active countries
export const getAllCountries = async (req, res, next) => {
  try {
    const { popular } = req.query;

    const query = { isActive: true };

    if (popular === 'true') {
      query.isPopular = true;
    }

    const countries = await Country.find(query)
      .sort({ name: 1 });

    res.status(200).json({ status: 'success', countries });
  } catch (err) {
    next(err);
  }
};

// Get single country
export const getCountry = async (req, res, next) => {
  try {
    const { id } = req.params;

    const country = await Country.findById(id);
    if (!country) throw new Error('Country not found');

    res.status(200).json({ status: 'success', country });
  } catch (err) {
    next(err);
  }
};
