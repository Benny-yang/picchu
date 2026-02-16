const TOKEN_KEY = 'azure_magnetar_token';
const USER_KEY = 'azure_magnetar_user';

export const tokenManager = {
    saveToken(token: string): void {
        localStorage.setItem(TOKEN_KEY, token);
    },

    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    },

    removeToken(): void {
        localStorage.removeItem(TOKEN_KEY);
    },

    saveUser(user: any): void {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    getUser(): any | null {
        const raw = localStorage.getItem(USER_KEY);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    },

    removeUser(): void {
        localStorage.removeItem(USER_KEY);
    },

    isLoggedIn(): boolean {
        return !!localStorage.getItem(TOKEN_KEY);
    },

    clearAll(): void {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },
};
