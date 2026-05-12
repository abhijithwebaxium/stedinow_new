import University from '../models/university.js';
import Country from '../models/country.js';

// Get all universities (optionally filtered by country)
export const getAllUniversities = async (req, res, next) => {
  try {
    const { country } = req.query;

    const query = { isActive: true };

    // If country name is provided, find the country ObjectId first
    if (country) {
      const countryDoc = await Country.findOne({ name: country });
      if (countryDoc) {
        query.country = countryDoc._id;
      }
    }

    const universities = await University.find(query)
      .populate('country', 'name code')
      .sort({ name: 1 })
      .limit(500); // Limit for performance

    res.status(200).json({ status: 'success', universities });
  } catch (err) {
    next(err);
  }
};

// Get single university
export const getUniversity = async (req, res, next) => {
  try {
    const { id } = req.params;

    const university = await University.findById(id)
      .populate('country', 'name code')
      .populate('courses');

    if (!university) throw new Error('University not found');

    res.status(200).json({ status: 'success', university });
  } catch (err) {
    next(err);
  }
};
