import User from '../models/user.js';
import Role from '../models/roles.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error('Email and password are required');
      error.statusCode = 400;
      throw error;
    }

    // Find user
    const user = await User.findOne({ email }).populate('role');

    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Check user status
    if (user.status !== 'Active') {
      const error = new Error('Your account has been suspended');
      error.statusCode = 403;
      throw error;
    }

    // Check role status
    if (!user.role.active) {
      const error = new Error('Your role has been suspended');
      error.statusCode = 403;
      throw error;
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    const isProd = process.env.NODE_ENV === 'production';
    // Set cookie
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send response
    res.status(200).json({
      status: 'success',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        permissions: user.role.permissions,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Logout
export const logout = async (req, res, next) => {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
    });
    res.status(200).json({ status: 'success', message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

// Get current user
export const getMe = async (req, res, next) => {
  try {
    if (!req.user || !req.user.isAuthenticated) {
      const error = new Error('Not authenticated');
      error.statusCode = 401;
      throw error;
    }

    const user = await User.findById(req.user.userId)
      .select('-password')
      .populate('role');

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      status: 'success',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        designation: user.designation,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Health check
export const healthCheck = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
};
