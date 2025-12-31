import express from 'express';
const router = express.Router();
import { createInvoice, getInvoices } from '../controllers/invoiceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router.route('/').post(protect, authorize('owner', 'staff'), createInvoice).get(protect, getInvoices);

export default router;
