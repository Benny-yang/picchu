import { ServiceError } from './authService';

/**
 * Handles API errors by extracting the message and throwing a ServiceError.
 * Centralised error handler for all service modules.
 */
export const handleApiError = (error: any, contextMsg: string): never => {
    console.error(`[ServiceError] ${contextMsg}:`, error);
    const message = error.response?.data?.message || error.message || 'Unknown error occurred';
    throw new ServiceError(message, { originalError: error, context: contextMsg });
};
