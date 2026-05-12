import express from 'express';
const router = express.Router();

import { requireAuth } from '../middleware/auth.js';
import {
  getAllUniversities,
  getUniversity,
} from '../controllers/universitiesController.js';

router.use(requireAuth);

// Get all universities (optionally filtered by country)
router.get('/', getAllUniversities);

// Get single university
router.get('/:id', getUniversity);

export default router;
