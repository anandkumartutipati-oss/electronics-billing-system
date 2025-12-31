import app from '../app.js';
import connectDB from '../config/db.js';

// Vercel Serverless Function Config
// We reuse the existing Express app but handle the DB connection per invocation (or cached)
// and export the handler.

// Cache the database connection
let isConnected = false;

const handler = async (req, res) => {
    // 1. debug: Check Env Vars (Don't expose secrets in production logs usually, but helpful here)
    if (!process.env.MONGO_URI) {
        return res.status(500).json({ error: 'MONGO_URI is missing in Vercel Environment Variables' });
    }

    try {
        if (!isConnected) {
            await connectDB();
            isConnected = true;
        }
    } catch (error) {
        console.error('Database connection failed:', error);
        return res.status(500).json({ error: 'Database Connection Failed', details: error.message });
    }

    return app(req, res);
};

export default handler;
