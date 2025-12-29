const BASE_URL = import.meta.env.MODE === 'development'
    ? 'http://localhost:5000/api'
    : ''; // Production URL to be added here

export default BASE_URL;
