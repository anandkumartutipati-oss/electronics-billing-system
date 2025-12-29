const mongoose = require('mongoose');

const discountSchema = mongoose.Schema({
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    name: { type: String, required: true }, // e.g., "Diwali Offer", "Bulk Purchase"
    type: {
        type: String,
        required: true,
        enum: ['Bulk', 'Festival', 'Loyalty', 'SpecialOffer']
    },
    scope: {
        type: String,
        required: true,
        enum: ['ShopWide', 'CategoryWide', 'ProductSpecific']
    },
    category: { type: String }, // Required if scope is CategoryWide
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Required if scope is ProductSpecific
    discountType: {
        type: String,
        required: true,
        enum: ['Percentage', 'FixedAmount']
    },
    value: { type: Number, required: true }, // e.g., 10 for 10% or 100 for ₹100
    minQuantity: { type: Number, default: 1 }, // Required for Bulk discounts
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Discount', discountSchema);
