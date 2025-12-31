import express from 'express';
const router = express.Router();
import { getEMIs, getEmiDetails, payEMI } from '../controllers/emiController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router.route('/').get(protect, getEMIs);
router.route('/:id').get(protect, getEmiDetails);
router.route('/:id/pay').post(protect, payEMI);

export default router;
