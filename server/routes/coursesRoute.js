import express from 'express';
const router = express.Router();

import { requireAuth, isAuthorized } from '../middleware/auth.js';
import uploadExcel from '../middleware/uploadExcel.js';
import {
  getAllCourses,
  getCourse,
  deleteCourse,
  deleteAllCourses,
  uploadCourses,
} from '../controllers/coursesController.js';

router.use(requireAuth);

// Get all courses (optionally filtered by university or country)
router.get('/', getAllCourses);

// Upload courses from Excel file
router.post('/upload', uploadExcel.single('file'), uploadCourses);

// Delete all courses
router.delete('/all', isAuthorized('users', 'delete'), deleteAllCourses);

// Get single course
router.get('/:id', getCourse);

// Delete single course
router.delete('/:id', isAuthorized('users', 'delete'), deleteCourse);

export default router;
