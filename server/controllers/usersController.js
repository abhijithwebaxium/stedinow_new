import User from '../models/user.js';
import Role from '../models/roles.js';
import bcrypt from 'bcryptjs';
import { isValidObjectId } from '../helper/indexHelper.js';

// List all users
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ status: { $ne: 'Deleted' } })
      .select('-password')
      .populate('role', 'name permissions')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ status: 'success', users });
  } catch (err) {
    next(err);
  }
};

// Get single user
export const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) throw new Error('Invalid user ID');

    const user = await User.findById(id)
      .select('-password')
      .populate('role', 'name permissions')
      .populate('createdBy', 'name email');

    if (!user) throw new Error('User not found');

    res.status(200).json({ status: 'success', user });
  } catch (err) {
    next(err);
  }
};

// Create user
export const createUser = async (req, res, next) => {
  try {
    const {
      body,
      user: { userId },
    } = req;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: body.email }, { phone: body.phone }],
    });

    if (existingUser) {
      throw new Error('User with this email or phone already exists');
    }

    // Validate role
    if (!isValidObjectId(body.role)) {
      throw new Error('Invalid role ID');
    }

    const role = await Role.findById(body.role);
    if (!role) {
      throw new Error('Role not found');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Create user
    const newUser = await User.create({
      ...body,
      password: hashedPassword,
      createdBy: userId,
    });

    // Add history
    newUser.history.push({
      type: 'Created',
      date: new Date(),
      notes: 'User account created',
      actionDoneBy: userId,
    });

    await newUser.save();

    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({ status: 'success', user: userResponse });
  } catch (err) {
    next(err);
  }
};

// Update user
export const updateUser = async (req, res, next) => {
  try {
    const {
      params: { id },
      body,
      user: { userId },
    } = req;

    if (!isValidObjectId(id)) throw new Error('Invalid user ID');

    const user = await User.findById(id);
    if (!user) throw new Error('User not found');

    // Don't allow password update through this endpoint
    if (body.password) {
      delete body.password;
    }

    // Update fields
    Object.assign(user, body);

    // Add history
    user.history.push({
      type: 'Updated',
      date: new Date(),
      notes: 'User information updated',
      actionDoneBy: userId,
    });

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({ status: 'success', user: userResponse });
  } catch (err) {
    next(err);
  }
};

// Change password
export const changePassword = async (req, res, next) => {
  try {
    const {
      params: { id },
      body: { newPassword },
      user: { userId },
    } = req;

    if (!isValidObjectId(id)) throw new Error('Invalid user ID');

    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const user = await User.findById(id);
    if (!user) throw new Error('User not found');

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Add history
    user.history.push({
      type: 'Password Changed',
      date: new Date(),
      notes: 'User password was changed',
      actionDoneBy: userId,
    });

    await user.save();

    res.status(200).json({ status: 'success', message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

// Delete user (soft delete by changing status)
export const deleteUser = async (req, res, next) => {
  try {
    const {
      params: { id },
      user: { userId },
    } = req;

    if (!isValidObjectId(id)) throw new Error('Invalid user ID');

    const user = await User.findById(id);
    if (!user) throw new Error('User not found');

    // Prevent self-deletion
    if (user._id.toString() === userId.toString()) {
      throw new Error('You cannot delete your own account');
    }

    user.status = 'Inactive';

    user.history.push({
      type: 'Deleted',
      date: new Date(),
      notes: 'User account deleted',
      actionDoneBy: userId,
    });

    await user.save();

    res.status(200).json({ status: 'success', message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Get all roles (helper endpoint for dropdowns)
export const getAllRoles = async (req, res, next) => {
  try {
    const roles = await Role.find({ active: true }).select('name description permissions');
    res.status(200).json({ status: 'success', roles });
  } catch (err) {
    next(err);
  }
};

// Get all application officers (helper endpoint for dropdowns)
export const getApplicationOfficers = async (req, res, next) => {
  try {
    // Find the "Admission Officer" role
    const admissionOfficerRole = await Role.findOne({ name: 'Admission Officer' });

    if (!admissionOfficerRole) {
      return res.status(200).json({ status: 'success', users: [] });
    }

    // Get all active users with Admission Officer role
    const applicationOfficers = await User.find({
      role: admissionOfficerRole._id,
      status: 'Active',
    })
      .select('name email designation')
      .sort({ name: 1 });

    res.status(200).json({ status: 'success', users: applicationOfficers });
  } catch (err) {
    next(err);
  }
};
