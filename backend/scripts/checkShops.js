const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Shop = require('../models/Shop');

// Load env from current directory (backend/.env)
dotenv.config({ path: './.env' });

const checkShops = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.log("Error: MONGO_URI not found.");
            console.log("Current Dir:", process.cwd());
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const count = await Shop.countDocuments();
        console.log(`Total Shops: ${count}`);

        if (count > 0) {
            const shops = await Shop.find({}, 'shopName');
            console.log('Shop Names:', shops.map(s => s.shopName));
        } else {
            console.log("No shops found in the database. Product import will fail.");
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkShops();
