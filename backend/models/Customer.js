import mongoose from 'mongoose';

const customerSchema = mongoose.Schema({
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    name: { type: String }, // Optional as per requirements
    mobile: { type: String }, // Optional
    address: { type: String }, // Optional
    gstNumber: { type: String }, // Optional
}, {
    timestamps: true
});

export default mongoose.model('Customer', customerSchema);
