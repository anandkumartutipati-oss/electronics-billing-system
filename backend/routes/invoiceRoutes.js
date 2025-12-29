const express = require('express');
const router = express.Router();
const { createInvoice, getInvoices } = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/').post(protect, authorize('owner', 'staff'), createInvoice).get(protect, getInvoices);

module.exports = router;
