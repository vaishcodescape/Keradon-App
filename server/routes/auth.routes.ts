import { Router } from 'express';
import { AppError } from '../middleware/errorHandler';
import { UserService } from '../models/User';

const router = Router();

// Register user
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      throw new AppError('Missing required fields', 400);
    }
    const data = await UserService.createUser(email, password, name);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

// Login user
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError('Missing email or password', 400);
    }
    const data = await UserService.signIn(email, password);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Logout user
router.post('/logout', async (req, res, next) => {
  try {
    await UserService.signOut();
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

export default router; 