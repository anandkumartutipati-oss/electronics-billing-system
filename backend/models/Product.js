const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    itemType: {
        type: String,
        required: true,
        enum: ['electronics', 'electrical']
    },
    category: { type: String, required: true },
    brand: { type: String, required: true },
    productName: { type: String, required: true },
    modelNumber: { type: String },
    skuCode: { type: String, required: true }, // Should be unique per shop ideally
    hsnCode: { type: String, required: true },
    unit: { type: String, required: true }, // piece, meter, box
    purchasePrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    gstPercent: { type: Number, required: true },
    stockQuantity: { type: Number, required: true },
    warrantyMonths: { type: Number },
    guaranteeMonths: { type: Number },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' }, // Optional link to supplier
    images: [{
        publicId: String,
        imageUrl: String
    }],
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

// Compound index to ensure SKU is unique per shop
productSchema.index({ shopId: 1, skuCode: 1 }, { unique: true });

module.exports = mongoose.model('Product', productSchema);
