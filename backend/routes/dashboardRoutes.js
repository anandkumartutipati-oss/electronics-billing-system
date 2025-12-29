const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getShopStats,
    getSalesGraph,
    getLowStockAlerts,
    getSuperAdminStats,
    getCategorySales,
    getPaymentStats
} = require('../controllers/dashboardController');

// All routes protected
router.use(protect);

router.get('/stats', authorize('owner', 'superadmin'), getShopStats);
router.get('/graph', authorize('owner', 'superadmin'), getSalesGraph);
router.get('/alerts', authorize('owner', 'superadmin'), getLowStockAlerts);
router.get('/category-sales', authorize('owner', 'superadmin'), getCategorySales);
router.get('/payment-stats', authorize('owner', 'superadmin'), getPaymentStats);
router.get('/admin/stats', authorize('superadmin'), getSuperAdminStats);

module.exports = router;
