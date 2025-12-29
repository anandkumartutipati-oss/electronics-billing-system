const mongoose = require('mongoose');

const shopSchema = mongoose.Schema({
    shopName: { type: String, required: true },
    shopType: {
        type: String,
        required: true,
        enum: ['electronics', 'electrical', 'both']
    },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    gstNumber: { type: String },
    isActive: { type: Boolean, default: true },
    customCategories: {
        electronics: { type: [String], default: [] },
        electrical: { type: [String], default: [] }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Shop', shopSchema);
