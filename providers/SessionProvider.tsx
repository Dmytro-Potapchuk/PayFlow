import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import { getToken, removeToken, saveToken } from "@/api/authStorage";

type SessionContextValue = {
    isReady: boolean;
    isAuthenticated: boolean;
    authenticate: (nextToken: string) => Promise<void>;
    clearSession: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);
const SessionTokenContext = createContext<string | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);

    const authenticate = useCallback(async (nextToken: string) => {
        await saveToken(nextToken);
        setToken(nextToken);
    }, []);

    const clearSession = useCallback(async () => {
        await removeToken();
        setToken(null);
    }, []);

    useEffect(() => {
        const bootstrap = async () => {
            const savedToken = await getToken();
            if (savedToken) {
                setToken(savedToken);
            }
            setIsReady(true);
        };

        bootstrap();
    }, []);

    const sessionValue = useMemo<SessionContextValue>(
        () => ({
            isReady,
            isAuthenticated: Boolean(token),
            authenticate,
            clearSession,
        }),
        [authenticate, clearSession, isReady, token]
    );

    return (
        <SessionContext.Provider value={sessionValue}>
            <SessionTokenContext.Provider value={token}>
                {children}
            </SessionTokenContext.Provider>
        </SessionContext.Provider>
    );
}

export function useSessionContext(): SessionContextValue {
    const context = useContext(SessionContext);

    if (!context) {
        throw new Error("useSessionContext must be used within SessionProvider");
    }

    return context;
}

/** Session token for providers and useRequireAuthToken — not for arbitrary UI. */
export function useSessionToken(): string | null {
    return useContext(SessionTokenContext);
}
