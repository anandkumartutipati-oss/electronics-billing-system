const express = require('express');
const router = express.Router();
const { createShop, getShops, getShopById, importShops } = require('../controllers/shopController');
const { protect, authorize } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.route('/import').post(protect, authorize('superadmin'), upload.single('file'), importShops);
router.route('/').post(protect, authorize('superadmin'), createShop).get(protect, authorize('superadmin'), getShops);
router.route('/:id').get(protect, getShopById);

module.exports = router;
