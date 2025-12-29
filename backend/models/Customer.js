const mongoose = require('mongoose');

const customerSchema = mongoose.Schema({
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    name: { type: String }, // Optional as per requirements
    mobile: { type: String }, // Optional
    address: { type: String }, // Optional
    gstNumber: { type: String }, // Optional
}, {
    timestamps: true
});

module.exports = mongoose.model('Customer', customerSchema);
