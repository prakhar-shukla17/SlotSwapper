import express from 'express';
import { register, login, logout, getMe, refreshToken } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.post('/logout', logout);
router.post('/refresh', refreshToken);

export default router;
