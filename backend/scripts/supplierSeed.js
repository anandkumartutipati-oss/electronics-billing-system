const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Shop = require('../models/Shop');
const Supplier = require('../models/Supplier');

// Load env vars
dotenv.config({ path: __dirname + '/../.env' });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const seedSuppliers = async () => {
    await connectDB();

    try {
        // Clear existing suppliers to avoid duplicates during dev testing? 
        // Or just add if missing. Let's clear for clean slate as per "first give me supplierseed.js" request implying setup.
        await Supplier.deleteMany({});
        console.log('Existing suppliers cleared.');

        const shops = await Shop.find({});
        if (shops.length === 0) {
            console.log('No shops found. Please create shops first.');
            process.exit();
        }

        const suppliers = [];

        for (const shop of shops) {
            const shopName = shop.shopName;

            // Create 3 suppliers per shop
            const shopSuppliers = [
                {
                    shopId: shop._id,
                    supplierName: `${shopName} Supplier A`,
                    phone: '1234567890',
                    gstNumber: 'GSTIN12345A',
                    address: `Warehouse A, ${shop.city}`
                },
                {
                    shopId: shop._id,
                    supplierName: `${shopName} Supplier B`,
                    phone: '0987654321',
                    gstNumber: 'GSTIN12345B',
                    address: `Warehouse B, ${shop.city}`
                },
                {
                    shopId: shop._id,
                    supplierName: `${shopName} Supplier C`,
                    phone: '1122334455',
                    gstNumber: 'GSTIN12345C',
                    address: `Warehouse C, ${shop.city}`
                }
            ];
            suppliers.push(...shopSuppliers);
        }

        await Supplier.insertMany(suppliers);
        console.log(`Successfully seeded ${suppliers.length} suppliers for ${shops.length} shops.`);
        process.exit();

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedSuppliers();
