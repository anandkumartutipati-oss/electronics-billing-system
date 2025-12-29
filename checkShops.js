const mongoose = require('mongoose');
const dotenv = require('dotenv'); // Attempt to load from default location or specific if needed
const Shop = require('./models/Shop');

// Adjust path to .env if this script is run from backend/ or root
// We will assume running from root: node checkShops.js
dotenv.config({ path: './backend/.env' });

const checkShops = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.log("Error: MONGO_URI not found. Make sure to run from root directory and .env exists in backend/");
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const count = await Shop.countDocuments();
        console.log(`Total Shops: ${count}`);

        if (count > 0) {
            const shops = await Shop.find({}, 'shopName');
            console.log('Shop Names:', shops.map(s => s.shopName));
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkShops();
