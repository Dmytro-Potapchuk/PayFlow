export const AUTH_FIELD_LIMITS = {
    login: { min: 1, max: 64 },
    email: { max: 254 },
    password: { min: 6, max: 128 },
} as const;
