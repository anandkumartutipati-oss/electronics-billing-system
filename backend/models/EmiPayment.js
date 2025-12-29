const mongoose = require('mongoose');

const emiPaymentSchema = mongoose.Schema({
    emiId: { type: mongoose.Schema.Types.ObjectId, ref: 'EMI', required: true },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true }, // For faster querying
    amountPaid: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    paymentMode: { type: String, enum: ['Cash', 'UPI'], default: 'Cash' },
    remarks: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('EmiPayment', emiPaymentSchema);
