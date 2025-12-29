const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { createProduct, getProducts, updateProduct, importProducts } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/').post(protect, authorize('owner', 'staff'), createProduct).get(protect, getProducts);
router.post('/import', protect, authorize('owner', 'superadmin'), upload.single('file'), importProducts);
router.route('/:id').put(protect, authorize('owner'), updateProduct);

module.exports = router;
