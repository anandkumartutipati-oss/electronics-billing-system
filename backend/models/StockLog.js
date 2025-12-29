const mongoose = require('mongoose');

const stockLogSchema = mongoose.Schema({
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    action: {
        type: String,
        enum: ['IN', 'OUT'],
        required: true
    },
    quantity: { type: Number, required: true },
    reference: {
        type: String,
        enum: ['Sale', 'Purchase', 'Return', 'Adjustment'],
        required: true
    },
    date: { type: Date, default: Date.now }
}, {
    timestamps: true
});

module.exports = mongoose.model('StockLog', stockLogSchema);
