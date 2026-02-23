/**
 * Utility functions for parsing and displaying user roles.
 * This is the single place for role-related string logic across the frontend.
 */

export type KnownRole = 'photographer' | 'model';

/** Maps raw role strings to their display labels. */
const ROLE_LABELS: Record<string, string> = {
    photographer: '攝影師',
    model: '模特兒',
};

/**
 * Parses roles from a user profile into a string array.
 * Handles both the `roles` JSON string and legacy boolean fields (isPhotographer, isModel).
 *
 * @param profile - A partial UserProfile-like object
 * @returns Normalized array of role strings, e.g. ['photographer', 'model']
 */
export function parseRoles(profile?: {
    roles?: string | string[] | null;
    isPhotographer?: boolean;
    isModel?: boolean;
}): string[] {
    if (!profile) return [];

    // Prefer the canonical `roles` field
    if (profile.roles) {
        if (Array.isArray(profile.roles)) {
            return profile.roles;
        }
        if (typeof profile.roles === 'string' && profile.roles.trim() !== '') {
            try {
                const parsed = JSON.parse(profile.roles);
                if (Array.isArray(parsed)) return parsed;
            } catch {
                // Malformed JSON — fall through to legacy fields
            }
        }
    }

    // Legacy fallback: derive from boolean flags
    const roles: string[] = [];
    if (profile.isPhotographer) roles.push('photographer');
    if (profile.isModel) roles.push('model');
    return roles;
}

/**
 * Returns the localised display label for a role string.
 * Falls back to the raw role string if no label is defined.
 */
export function getRoleLabel(role: string): string {
    return ROLE_LABELS[role] ?? role;
}

/**
 * Returns formatted, localised role labels joined by a separator.
 * Convenient for rendering a list of roles inline.
 */
export function formatRoles(roles: string[], separator = ' / '): string {
    return roles.map(getRoleLabel).join(separator);
}
