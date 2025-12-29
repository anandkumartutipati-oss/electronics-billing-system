const Shop = require('../models/Shop');
const User = require('../models/User');
const fs = require('fs');
const csv = require('csv-parser');
const bcrypt = require('bcrypt'); // Needed if creating passwords manually, though User model pre-save handles hashing if using instance


// @desc    Create a new shop (Super Admin)
// @route   POST /api/shops
// @access  Private/SuperAdmin
const createShop = async (req, res) => {
    const {
        shopName,
        shopType,
        ownerId,
        phone,
        email,
        address,
        city,
        state,
        pincode,
        gstNumber
    } = req.body;

    try {
        const shop = await Shop.create({
            shopName,
            shopType,
            ownerId,
            phone,
            email,
            address,
            city,
            state,
            pincode,
            gstNumber
        });

        res.status(201).json(shop);
    } catch (error) {
        res.status(400).json({ message: 'Invalid shop data', error: error.message });
    }
};

// @desc    Get all shops
// @route   GET /api/shops
// @access  Private/SuperAdmin
const getShops = async (req, res) => {
    try {
        const shops = await Shop.find({}).populate('ownerId', 'name email');
        res.json(shops);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get shop by ID
// @route   GET /api/shops/:id
// @access  Private
const getShopById = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);

        if (shop) {
            res.json(shop);
        } else {
            res.status(404).json({ message: 'Shop not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Import shops from CSV
// @route   POST /api/shops/import
// @access  Private/SuperAdmin
const importShops = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Please upload a CSV file' });
    }

    const results = [];
    const errors = [];
    const successCount = { users: 0, shops: 0 };

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            // Process Data
            // Expected Columns: shopName, shopType, phone, address, city, state, pincode, ownerName, ownerEmail, ownerMobile, ownerPassword

            if (results.length > 0) {
                const firstRow = results[0];
                if (!firstRow.ownerEmail || !firstRow.ownerName) {
                    return res.status(400).json({
                        message: 'Invalid CSV Format. Please ensure the CSV contains ownerName and ownerEmail columns.'
                    });
                }
            }

            for (const row of results) {
                try {
                    // 1. Create or Find Owner
                    let owner = await User.findOne({ email: row.ownerEmail });

                    if (!owner) {
                        owner = await User.create({
                            name: row.ownerName,
                            email: row.ownerEmail,
                            mobile: row.ownerMobile,
                            password: row.ownerPassword || '123456', // Default pass if missing
                            role: 'owner',
                            isActive: true
                        });
                        successCount.users++;
                    }

                    // 2. Create Shop linked to Owner
                    // Check if shop exists
                    const shopExists = await Shop.findOne({ shopName: row.shopName });

                    if (!shopExists) {
                        const shop = await Shop.create({
                            shopName: row.shopName,
                            shopType: row.shopType ? row.shopType.toLowerCase() : 'both',
                            ownerId: owner._id,
                            phone: row.phone,
                            email: row.ownerEmail, // Use owner email for shop contact if not provided
                            address: row.address,
                            city: row.city,
                            state: row.state,
                            pincode: row.pincode,
                            isActive: true
                        });

                        // Link shop to user
                        owner.shopId = shop._id;
                        await owner.save();

                        successCount.shops++;
                    }

                } catch (error) {
                    console.error(error);
                    errors.push({ row: row, error: error.message });
                }
            }

            // Cleanup Uploaded File
            fs.unlinkSync(req.file.path);

            res.status(200).json({
                message: 'Import Processed',
                successCount,
                errors: errors.length > 0 ? errors : null
            });
        });
};

module.exports = { createShop, getShops, getShopById, importShops };
