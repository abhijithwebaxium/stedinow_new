import express from 'express';
const router = express.Router();

import { isAuthorized, requireAuth } from '../middleware/auth.js';
import {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  changePassword,
  deleteUser,
  getAllRoles,
  getApplicationOfficers,
} from '../controllers/usersController.js';

router.use(requireAuth);

// Get all roles (for dropdowns)
router.get('/roles', getAllRoles);

// Get all application officers (for dropdowns)
router.get('/application-officers', getApplicationOfficers);

// List all users
router.get('/', isAuthorized('users', 'read'), getAllUsers);

// Get details of a specific user
router.get('/:id', isAuthorized('users', 'read'), getUser);

// Create a new user
router.post('/', isAuthorized('users', 'create'), createUser);

// Update a specific user
router.patch('/:id', isAuthorized('users', 'update'), updateUser);

// Change user password
router.patch('/:id/password', isAuthorized('users', 'update'), changePassword);

// Delete a specific user
router.delete('/:id', isAuthorized('users', 'delete'), deleteUser);

export default router;
