import app from '../app.js';
import connectDB from '../config/db.js';

// Vercel Serverless Function Config
// We reuse the existing Express app but handle the DB connection per invocation (or cached)
// and export the handler.

// Cache the database connection
let isConnected = false;

const handler = async (req, res) => {
    if (!isConnected) {
        await connectDB();
        isConnected = true;
    }

    return app(req, res);
};

export default handler;
