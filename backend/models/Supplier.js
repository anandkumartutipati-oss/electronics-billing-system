const mongoose = require('mongoose');

const supplierSchema = mongoose.Schema({
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    supplierName: { type: String, required: true },
    phone: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^\d{10}$/.test(v);
            },
            message: props => `${props.value} is not a valid 10-digit phone number!`
        }
    },
    gstNumber: { type: String },
    streetAddress: { type: String },
    city: { type: String },
    district: { type: String },
    pincode: { type: String },
    landmark: { type: String },
    state: { type: String },
    address: { type: String } // Keeping for legacy or combined storage if needed
}, {
    timestamps: true
});

module.exports = mongoose.model('Supplier', supplierSchema);
