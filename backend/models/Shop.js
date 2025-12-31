import mongoose from 'mongoose';

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
    logo: { type: String, default: '' },
    terms: { type: String, default: 'Goods once sold will not be taken back.\nWarranty as per manufacturer terms.' },
    customCategories: {
        electronics: { type: [String], default: [] },
        electrical: { type: [String], default: [] }
    }
}, {
    timestamps: true
});

export default mongoose.model('Shop', shopSchema);
