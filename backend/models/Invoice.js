const mongoose = require('mongoose');

const invoiceSchema = mongoose.Schema({
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    invoiceNumber: { type: String, required: true }, // Logic to generate unique invoice no per shop needed
    customerDetails: {
        name: String,
        mobile: String,
        address: String
    },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        productName: String,
        modelNumber: String,
        hsnCode: String,
        quantity: Number,
        unit: String,
        price: Number, // Original selling price at time of sale
        discountAmount: { type: Number, default: 0 },
        appliedDiscountType: { type: String }, // Bulk, Festival, Loyalty, SpecialOffer
        finalPrice: Number, // Price after discount
        gstPercent: Number,
        gstAmount: Number,
        total: Number,
        warrantyMonths: Number,
        guaranteeMonths: Number
    }],
    subTotal: { type: Number, required: true },
    totalGST: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    paymentType: {
        type: String,
        required: true,
        enum: ['Cash', 'UPI', 'Card', 'EMI', 'Mixed']
    },
    paymentBreakdown: {
        cash: { type: Number, default: 0 },
        upi: { type: Number, default: 0 },
        card: { type: Number, default: 0 },
        emi: { type: Number, default: 0 }
    },
    paymentStatus: {
        type: String,
        enum: ['Paid', 'Pending', 'Partial'],
        default: 'Paid'
    },
    billedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Invoice', invoiceSchema);
