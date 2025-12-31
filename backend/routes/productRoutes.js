import express from 'express';
const router = express.Router();
import upload from '../middleware/uploadMiddleware.js';
import { createProduct, getProducts, updateProduct, importProducts } from '../controllers/productController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router.route('/').post(protect, authorize('owner', 'staff'), createProduct).get(protect, getProducts);
router.post('/import', protect, authorize('owner', 'superadmin'), upload.single('file'), importProducts);
router.route('/:id').put(protect, authorize('owner'), updateProduct);

export default router;
