const express = require('express');
const router = express.Router();
const { createSupplier, getSuppliers, deleteSupplier } = require('../controllers/supplierController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/').post(protect, authorize('owner'), createSupplier).get(protect, getSuppliers);
router.route('/:id').delete(protect, authorize('owner'), deleteSupplier);
module.exports = router;
