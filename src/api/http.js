import axios from 'axios';
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const http = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});
http.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('pa_access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);
http.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('pa_access_token');
            localStorage.removeItem('pa_refresh_token');
        }
        return Promise.reject(error);
    }
);

export default http;
