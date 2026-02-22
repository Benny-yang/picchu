import api from './api';
import { tokenManager } from './tokenManager';
import { handleApiError } from './serviceUtils';
import type { ApiResponse } from '../types';

export const authService = {
    register: async (email: string, password: string): Promise<ApiResponse<string>> => {
        try {
            const response = await api.post('/auth/register', { email, password });
            return response.data;
        } catch (error) {
            return handleApiError(error, 'Register failed');
        }
    },

    login: async (email: string, password: string, rememberMe: boolean = false): Promise<ApiResponse<{ token: string; user: any }>> => {
        try {
            const response = await api.post('/auth/login', { email, password, rememberMe });
            const result = response.data;

            // Persist token and user on successful login
            if (result.data?.token) {
                tokenManager.saveToken(result.data.token);
            }
            if (result.data?.user) {
                tokenManager.saveUser(result.data.user);
            }

            return result;
        } catch (error) {
            return handleApiError(error, 'Login failed');
        }
    },

    logout: (): void => {
        tokenManager.clearAll();
    },

    getMe: async (): Promise<any> => {
        try {
            const response = await api.get('/users/me');
            const user = response.data.data;
            tokenManager.saveUser(user);
            return user;
        } catch (error) {
            return handleApiError(error, 'Get current user failed');
        }
    },

    getPublicProfile: async (userId: number): Promise<any> => {
        try {
            const response = await api.get(`/users/${userId}`);
            return response.data.data;
        } catch (error) {
            return handleApiError(error, `Get user ${userId} failed`);
        }
    },

    updateProfile: async (data: any): Promise<any> => {
        try {
            const response = await api.put('/users/me', data);
            const updatedUser = response.data.data;
            tokenManager.saveUser(updatedUser);
            return updatedUser;
        } catch (error) {
            return handleApiError(error, 'Update profile failed');
        }
    },

    getUserWorks: async (userId: number): Promise<any[]> => {
        try {
            const response = await api.get(`/users/${userId}/works`);
            return response.data.data || [];
        } catch (error) {
            return handleApiError(error, `Get user ${userId} works failed`);
        }
    },

    getUserActivities: async (userId: number): Promise<any[]> => {
        try {
            const response = await api.get(`/users/${userId}/activities`);
            return response.data.data || [];
        } catch (error) {
            return handleApiError(error, `Get user ${userId} activities failed`);
        }
    },

    getMyApplications: async (): Promise<any[]> => {
        try {
            const response = await api.get('/users/me/applications');
            return response.data.data || [];
        } catch (error) {
            return handleApiError(error, 'Get my applications failed');
        }
    },

    forgotPassword: async (email: string): Promise<ApiResponse<string>> => {
        try {
            const response = await api.post('/auth/forgot-password', { email });
            return response.data;
        } catch (error) {
            return handleApiError(error, 'Forgot password request failed');
        }
    },

    resetPassword: async (token: string, newPassword: string): Promise<ApiResponse<string>> => {
        try {
            const response = await api.post('/auth/reset-password', { token, newPassword });
            return response.data;
        } catch (error) {
            return handleApiError(error, 'Reset password failed');
        }
    },

    resendVerification: async (email: string): Promise<ApiResponse<string>> => {
        try {
            const response = await api.post('/auth/resend-verification', { email });
            return response.data;
        } catch (error) {
            return handleApiError(error, 'Resend verification email failed');
        }
    },
};
