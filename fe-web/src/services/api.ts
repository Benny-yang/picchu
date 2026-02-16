import axios from 'axios';
import { tokenManager } from './tokenManager';

const api = axios.create({
    baseURL: 'http://localhost:8080/api/v1',
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
        if (error.response?.status === 401) {
            tokenManager.clearAll();
            // Navigate to login via URL param (matches app routing)
            window.location.href = '?view=selection';
        }
        return Promise.reject(error);
    }
);

export default api;
