import express from 'express';
const router = express.Router();
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
    getShopStats,
    getSalesGraph,
    getLowStockAlerts,
    getSuperAdminStats,
    getCategorySales,
    getPaymentStats
} from '../controllers/dashboardController.js';

// All routes protected
router.use(protect);

router.get('/stats', authorize('owner', 'superadmin'), getShopStats);
router.get('/graph', authorize('owner', 'superadmin'), getSalesGraph);
router.get('/alerts', authorize('owner', 'superadmin'), getLowStockAlerts);
router.get('/category-sales', authorize('owner', 'superadmin'), getCategorySales);
router.get('/payment-stats', authorize('owner', 'superadmin'), getPaymentStats);
router.get('/admin/stats', authorize('superadmin'), getSuperAdminStats);

export default router;
