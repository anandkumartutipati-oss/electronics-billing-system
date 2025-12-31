
import express from 'express';
const router = express.Router();
import { createShop, getShops, getShopById, importShops, updateShopSettings } from '../controllers/shopController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });

router.route('/import').post(protect, authorize('superadmin'), upload.single('file'), importShops);
router.route('/').post(protect, authorize('superadmin'), createShop).get(protect, authorize('superadmin'), getShops);
router.route('/profile').put(protect, updateShopSettings);
router.route('/:id').get(protect, getShopById);

export default router;
