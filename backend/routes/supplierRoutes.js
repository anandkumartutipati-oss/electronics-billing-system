import express from 'express';
const router = express.Router();
import { createSupplier, getSuppliers, deleteSupplier } from '../controllers/supplierController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router.route('/').post(protect, authorize('owner'), createSupplier).get(protect, getSuppliers);
router.route('/:id').delete(protect, authorize('owner'), deleteSupplier);
export default router;
