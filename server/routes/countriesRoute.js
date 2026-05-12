import express from 'express';
const router = express.Router();

import { requireAuth } from '../middleware/auth.js';
import {
  getAllCountries,
  getCountry,
} from '../controllers/countriesController.js';

router.use(requireAuth);

// Get all countries
router.get('/', getAllCountries);

// Get single country
router.get('/:id', getCountry);

export default router;
