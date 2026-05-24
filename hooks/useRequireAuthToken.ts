import { useCallback } from "react";

import { useSessionToken } from "@/providers/SessionProvider";
import { useToast } from "@/providers/AppProvider";

const DEFAULT_MISSING_TOKEN_MESSAGE = "Brak sesji – zaloguj się ponownie.";

/**
 * Returns the in-memory session token from SessionProvider.
 * Prefer provider actions when possible; use requireToken() before API calls.
 */
export function useRequireAuthToken() {
    const token = useSessionToken();
    const { showToast } = useToast();

    const requireToken = useCallback(
        (message: string = DEFAULT_MISSING_TOKEN_MESSAGE): string | null => {
            if (!token) {
                showToast("Błąd", message, "error");
                return null;
            }

            return token;
        },
        [showToast, token]
    );

    return { token, requireToken, hasToken: Boolean(token) };
}
