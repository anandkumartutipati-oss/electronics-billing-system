import express from 'express';
const router = express.Router();
import { createDiscount, getDiscounts, updateDiscount } from '../controllers/discountController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router.route('/')
    .get(protect, authorize('owner', 'staff'), getDiscounts)
    .post(protect, authorize('owner'), createDiscount);

router.route('/:id')
    .put(protect, authorize('owner'), updateDiscount);

export default router;
