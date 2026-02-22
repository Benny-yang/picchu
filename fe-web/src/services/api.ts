import axios from 'axios';
import { tokenManager } from './tokenManager';
import { API_URL } from '../config';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Automatically attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = tokenManager.getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses globally — clear stale token and redirect to login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Check if the request is for login or register or forgot/reset password
        const isAuthRequest = error.config?.url?.includes('/auth/');
        if (error.response?.status === 401 && !isAuthRequest) {
            tokenManager.clearAll();
            // Navigate to login via URL param (matches app routing)
            window.location.href = '?view=selection';
        }
        return Promise.reject(error);
    }
);

export default api;
