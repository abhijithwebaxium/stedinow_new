import mongoose from 'mongoose';
import Users from '../models/user.js';
import Students from '../models/Student.js';

export const isValidDate = (str) => !isNaN(Date.parse(str));

export const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// User helpers
export const getAllUsersHelper = async (excludeId, roleFilter, project) => {
  try {
    const query = { status: 'Active' };

    if (excludeId) query._id = { $ne: excludeId };

    if (roleFilter) {
      query.role = roleFilter;
    }

    const projection = project || {};

    const users = await Users.find(query, projection)
      .select('-password')
      .populate('role', 'name');
    return users;
  } catch (err) {
    console.error('Error fetching users:', err);
    throw new Error('Failed to fetch users');
  }
};

export const getUserHelper = async (id, project) => {
  try {
    if (!isValidObjectId(id)) {
      throw new Error('Invalid User ID');
    }

    const query = { _id: id, status: 'Active' };
    const projection = project || {};

    const user = await Users.findOne(query, projection).select('-password');
    return user;
  } catch (err) {
    console.error('Error fetching user:', err);
    throw new Error('Failed to fetch user');
  }
};

// Student helpers
export const getAllStudentsHelper = async (createdBy, project) => {
  try {
    const query = { deleted: false };

    if (createdBy) {
      if (!isValidObjectId(createdBy)) {
        throw new Error('Invalid User ID');
      }
      query.createdBy = createdBy;
    }

    const projection = project || {};

    const students = await Students.find(query, projection).populate(
      'assigned.counselor',
      'name email'
    );
    return students;
  } catch (err) {
    console.error('Error fetching students:', err);
    throw new Error('Failed to fetch students');
  }
};

export const getStudentHelper = async (id, project) => {
  try {
    if (!isValidObjectId(id)) {
      throw new Error('Invalid Student ID');
    }

    const query = { _id: id, deleted: false };
    const projection = project || {};

    const student = await Students.findOne(query, projection);
    return student;
  } catch (err) {
    console.error('Error fetching student:', err);
    throw new Error('Failed to fetch student');
  }
};

export default {
  isValidDate,
  isValidObjectId,
  getAllUsersHelper,
  getUserHelper,
  getAllStudentsHelper,
  getStudentHelper,
};
