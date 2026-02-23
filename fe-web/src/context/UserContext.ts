import { createContext, useContext } from 'react';
import type { User } from '../types';

interface UserContextValue {
    currentUser: User | null;
    setCurrentUser: (user: User | null) => void;
}

export const UserContext = createContext<UserContextValue>({
    currentUser: null,
    setCurrentUser: () => { },
});

/** Hook for accessing the current authenticated user from context. */
export function useCurrentUser() {
    return useContext(UserContext);
}
