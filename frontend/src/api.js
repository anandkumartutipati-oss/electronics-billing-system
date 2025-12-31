const BASE_URL = import.meta.env.MODE === 'development'
    ? 'http://localhost:5000/api'
    : '/api'; // Production URL for Vercel

export default BASE_URL;
