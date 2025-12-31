const BASE_URL = import.meta.env.MODE === 'development'
    ? 'http://localhost:5000/api'
    : 'https://electronics-billing-system-backend.onrender.com/api'; // Production URL for Vercel

export default BASE_URL;
