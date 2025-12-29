const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { createProduct, getProducts, updateProduct, importProducts } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/').post(protect, authorize('owner', 'staff'), upload.single('image'), createProduct).get(protect, getProducts);
router.post('/import', protect, authorize('owner', 'superadmin'), upload.single('file'), importProducts);
router.route('/:id').put(protect, authorize('owner'), upload.single('image'), updateProduct);

module.exports = router;
