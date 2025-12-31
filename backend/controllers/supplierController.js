import Supplier from '../models/Supplier.js';

// @desc    Create a new supplier
// @route   POST /api/suppliers
// @access  Private (Owner)
const createSupplier = async (req, res) => {
    try {
        const { supplierName, phone, gstNumber, streetAddress, city, district, pincode, landmark, state } = req.body;

        if (!req.user.shopId) {
            return res.status(400).json({ message: 'User not assigned to a shop' });
        }

        const supplier = await Supplier.create({
            shopId: req.user.shopId,
            supplierName,
            phone,
            gstNumber,
            streetAddress,
            city,
            district,
            pincode,
            landmark,
            state,
            address: `${streetAddress}, ${landmark ? landmark + ', ' : ''}${city}, ${district}, ${state} - ${pincode}`
        });

        res.status(201).json(supplier);
    } catch (error) {
        res.status(400).json({ message: 'Error creating supplier', error: error.message });
    }
};

// @desc    Get all suppliers for a shop
// @route   GET /api/suppliers
// @access  Private (Owner/Staff)
const getSuppliers = async (req, res) => {
    try {
        if (!req.user.shopId) {
            return res.status(400).json({ message: 'User not assigned to a shop' });
        }

        const suppliers = await Supplier.find({ shopId: req.user.shopId });
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a supplier
// @route   DELETE /api/suppliers/:id
// @access  Private (Owner)
const deleteSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);

        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        // Verify shop ownership
        if (supplier.shopId.toString() !== req.user.shopId.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await supplier.deleteOne();
        res.json({ message: 'Supplier removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export { createSupplier, getSuppliers, deleteSupplier };
