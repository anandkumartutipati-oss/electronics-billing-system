const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');

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

const clearProducts = async () => {
    await connectDB();
    try {
        await Product.deleteMany({});
        console.log('All products cleared from database.');
        process.exit();
    } catch (error) {
        console.error('Error clearing products:', error);
        process.exit(1);
    }
};

clearProducts();
