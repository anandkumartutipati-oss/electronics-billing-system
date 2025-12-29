import axios from 'axios';

const setupAxiosInterceptors = (store) => {
    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response && error.response.status === 401) {
                // Determine if it's a session issue or just bad login
                const errorMessage = error.response.data.message || '';

                // If token failed or session expired, we should logout
                // cleaning local storage immediately
                localStorage.removeItem('user');

                // We can also dispatch logout if we had access to dispatch, 
                // but hard reload/redirect is safer to clear state issues
                if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/landing')) {
                    window.location.href = '/login';
                }
            }
            return Promise.reject(error);
        }
    );
};

export default setupAxiosInterceptors;
