import express from 'express';
const router = express.Router();
import { loginUser, registerUser, updateUserProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/login', loginUser);
router.post('/register', registerUser);
router.put('/profile', protect, updateUserProfile);

export default router;
