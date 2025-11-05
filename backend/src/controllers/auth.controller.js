import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import AppError from '../utils/appError.js';
import { generateToken } from '../utils/generateToken.js';






export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return next(new AppError('Please provide all required fields', 400));
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('User with this email already exists', 400));
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with hashed password
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // Generate token and send response
    generateToken(user, res);
    
    res.status(201).json({
      message: 'User Registered',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      }
    });
  } catch (error) {
    next(error);
  }
};





export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password are provided
    if (!email || !password) {
      return next(new AppError('Please provide both email and password', 400));
    }

    // 2) Find user by email and include password field
    const user = await User.findOne({ email }).select('+password');
    
    // 3) Check if user exists and password is correct
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // 4) If everything is correct, generate and send token
    generateToken(user, res);
    
    res.status(200).json({
      message: 'User Logged in',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  // Clear the JWT cookie
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
  
  res.status(200).json({ 
    status: 'success',
    message: 'Successfully logged out' 
  });
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-__v');
    
    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          active: user.active
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    // The token is already verified by the protect middleware
    // We just need to generate a new one and send it
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return next(new AppError('User no longer exists', 401));
    }
    
    // Generate new token and set cookie
    generateToken(user, res);
    
    res.status(200).json({
      status: 'success',
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    next(error);
  }
};
