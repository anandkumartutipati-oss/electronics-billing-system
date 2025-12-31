import Discount from '../models/Discount.js';
import Product from '../models/Product.js';
import Invoice from '../models/Invoice.js';

// @desc    Create a discount rule
// @route   POST /api/discounts
// @access  Private (Owner)
const createDiscount = async (req, res) => {
    try {
        const {
            name,
            type,
            scope,
            category,
            productId,
            discountType,
            value,
            minQuantity,
            startDate,
            endDate
        } = req.body;

        const discount = new Discount({
            shopId: req.user.shopId,
            name,
            type,
            scope,
            category,
            productId,
            discountType,
            value,
            minQuantity,
            startDate: startDate || null,
            endDate: endDate || null
        });

        const createdDiscount = await discount.save();
        res.status(201).json(createdDiscount);
    } catch (error) {
        res.status(400).json({ message: 'Invalid discount data', error: error.message });
    }
};

// @desc    Get all discounts for a shop
// @route   GET /api/discounts
// @access  Private (Owner/Staff)
const getDiscounts = async (req, res) => {
    try {
        const discounts = await Discount.find({ shopId: req.user.shopId });
        res.json(discounts);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update a discount rule
// @route   PUT /api/discounts/:id
// @access  Private (Owner)
const updateDiscount = async (req, res) => {
    try {
        const discount = await Discount.findById(req.params.id);

        if (discount && discount.shopId.toString() === req.user.shopId.toString()) {
            discount.name = req.body.name || discount.name;
            discount.isActive = req.body.isActive !== undefined ? req.body.isActive : discount.isActive;
            discount.value = req.body.value !== undefined ? req.body.value : discount.value;
            discount.startDate = req.body.startDate || discount.startDate;
            discount.endDate = req.body.endDate || discount.endDate;

            const updatedDiscount = await discount.save();
            res.json(updatedDiscount);
        } else {
            res.status(404).json({ message: 'Discount not found or unauthorized' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error: error.message });
    }
};

// @desc    Calculate discount for a set of items
// Helper function used by Invoice creation
const calculateBestDiscount = async (shopId, items, customerId = null) => {
    const activeDiscounts = await Discount.find({
        shopId,
        isActive: true,
        $or: [
            { startDate: null, endDate: null },
            { startDate: { $lte: new Date() }, endDate: { $gte: new Date() } }
        ]
    });

    // Special handling for Customer Loyalty would go here (requires orders count)
    // For now, let's focus on Festival and Bulk.

    return items.map(item => {
        const productDiscounts = activeDiscounts.filter(d =>
            d.scope === 'ShopWide' ||
            (d.scope === 'CategoryWide' && d.category === item.category) ||
            (d.scope === 'ProductSpecific' && d.productId.toString() === item.productId.toString())
        );

        // Festival > Bulk Priority
        const festival = productDiscounts.find(d => d.type === 'Festival');
        const bulk = productDiscounts.find(d => d.type === 'Bulk' && item.quantity >= d.minQuantity);

        let bestDiscount = null;
        if (festival) {
            bestDiscount = festival;
        } else if (bulk) {
            bestDiscount = bulk;
        }

        let discountAmount = 0;
        if (bestDiscount) {
            if (bestDiscount.discountType === 'Percentage') {
                discountAmount = (item.price * bestDiscount.value) / 100;
            } else {
                discountAmount = bestDiscount.value;
            }
        }

        const finalPrice = item.price - discountAmount;
        return {
            ...item,
            discountAmount,
            appliedDiscountType: bestDiscount ? bestDiscount.type : null,
            finalPrice
        };
    });
};

export { createDiscount, getDiscounts, updateDiscount, calculateBestDiscount };
