const express = require('express');
const router = express.Router();
const { getEMIs, getEmiDetails, payEMI } = require('../controllers/emiController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/').get(protect, getEMIs);
router.route('/:id').get(protect, getEmiDetails);
router.route('/:id/pay').post(protect, payEMI);

module.exports = router;
