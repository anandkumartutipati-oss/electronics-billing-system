require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Shop = require('./models/Shop');
const connectDB = require('./config/db');

const importData = async () => {
    try {
        await connectDB();

        // Check if super admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@example.com' });

        if (existingAdmin) {
            console.log('Super Admin already exists!');
            process.exit();
        }

        const superAdmin = {
            name: 'Super Admin',
            email: 'admin@example.com',
            mobile: '9876543210',
            password: 'password123', // Will be hashed by pre-save hook
            role: 'superadmin',
            isActive: true
        };

        await User.create(superAdmin);

        console.log('Data Imported!');
        console.log('Super Admin Created:');
        console.log('Email: admin@example.com');
        console.log('Password: password123');

        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
