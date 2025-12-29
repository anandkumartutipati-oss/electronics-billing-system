const mongoose = require('mongoose');

const emiSchema = mongoose.Schema({
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
    customerName: { type: String, required: true }, // Snapshot from invoice
    customerMobile: { type: String, required: true },
    principalAmount: { type: Number, required: true }, // Amount to be paid via EMI
    interestRate: { type: Number, required: true }, // Annual interest rate
    tenureType: { type: String, enum: ['months', 'years'], required: true },
    tenureValue: { type: Number, required: true },
    emiAmount: { type: Number, required: true }, // Monthly EMI
    totalPayable: { type: Number, required: true }, // Principal + Interest
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    emiStatus: {
        type: String,
        enum: ['Active', 'Completed', 'Defaulted'],
        default: 'Active'
    },
    nextDueDate: { type: Date }
}, {
    timestamps: true
});

module.exports = mongoose.model('EMI', emiSchema);
