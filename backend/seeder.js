import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Shop from './models/Shop.js';
import connectDB from './config/db.js';

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
