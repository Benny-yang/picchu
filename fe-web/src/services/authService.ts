import api from './api';

export const authService = {
    register: async (email: string, password: string) => {
        const response = await api.post('/auth/register', {
            email,
            password,
        });
        return response.data;
    },
    login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', {
            email,
            password,
        });
        return response.data;
    },
    updateProfile: async (id: number, data: any) => {
        const response = await api.put(`/users/${id}/profile`, data);
        return response.data;
    }
};
