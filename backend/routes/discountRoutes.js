const express = require('express');
const router = express.Router();
const { createDiscount, getDiscounts, updateDiscount } = require('../controllers/discountController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, authorize('owner', 'staff'), getDiscounts)
    .post(protect, authorize('owner'), createDiscount);

router.route('/:id')
    .put(protect, authorize('owner'), updateDiscount);

module.exports = router;
