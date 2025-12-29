const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');

// Load env from current directory (backend/.env)
dotenv.config({ path: './.env' });

const checkProducts = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.log("Error: MONGO_URI not found.");
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const count = await Product.countDocuments();
        console.log(`Total Products: ${count}`);

        if (count > 0) {
            const products = await Product.find().limit(5);
            console.log('Sample Products:', products.map(p => ({ name: p.productName, shopId: p.shopId })));
        } else {
            console.log("No products found in the database.");
        }

        // CHECK USER
        const User = require('../models/User');
        const users = await User.find({ role: 'owner' }).limit(5);
        console.log('Sample Owners:', users.map(u => ({ email: u.email, shopId: u.shopId })));

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkProducts();
