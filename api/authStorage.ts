import {
    getSecureItem,
    removeSecureItem,
    setSecureItem,
} from "./secureStorage";

const ACCESS_TOKEN_KEY = "@payflow/auth/access_token";

export async function saveToken(token: string): Promise<void> {
    await setSecureItem(ACCESS_TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
    return getSecureItem(ACCESS_TOKEN_KEY);
}

export async function removeToken(): Promise<void> {
    await removeSecureItem(ACCESS_TOKEN_KEY);
}
