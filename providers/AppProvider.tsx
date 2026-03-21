import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { AppState, type AppStateStatus } from "react-native";

import { getToken, removeToken, saveToken } from "@/api/authStorage";
import { getDashboard } from "@/api/dashboard.api";
import { getMessages } from "@/api/messages.api";
import { getProfile } from "@/api/users.api";
import type { DashboardData } from "@/types/dashboard";
import type { Message, MessageType } from "@/types/message";

type UserProfile = {
    _id?: string;
    login: string;
    email: string;
    role?: string;
    phone?: string;
};

type Toast = {
    id: string;
    title: string;
    message: string;
    type: MessageType;
};

type RefreshOptions = {
    silent?: boolean;
    skipToast?: boolean;
};

type AppContextValue = {
    token: string | null;
    profile: UserProfile | null;
    dashboard: DashboardData;
    messages: Message[];
    unreadMessages: number;
    toasts: Toast[];
    isReady: boolean;
    showSensitiveData: boolean;
    authenticate: (nextToken: string) => Promise<void>;
    clearSession: () => Promise<void>;
    refreshProfile: (options?: RefreshOptions) => Promise<UserProfile | null>;
    refreshDashboard: (options?: RefreshOptions) => Promise<DashboardData | null>;
    refreshMessages: (options?: RefreshOptions) => Promise<Message[]>;
    showToast: (title: string, message: string, type?: MessageType) => void;
    dismissToast: (id: string) => void;
    toggleSensitiveData: () => void;
};

const EMPTY_DASHBOARD: DashboardData = {
    balance: 0,
    balanceEur: 0,
    balanceUsd: 0,
    recentTransactions: [],
    unreadMessages: 0,
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [dashboard, setDashboard] = useState<DashboardData>(EMPTY_DASHBOARD);
    const [messages, setMessages] = useState<Message[]>([]);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [isReady, setIsReady] = useState(false);
    const [showSensitiveData, setShowSensitiveData] = useState(false);
    const appStateRef = useRef<AppStateStatus>(AppState.currentState);
    const knownMessageIdsRef = useRef<Set<string>>(new Set());
    const didPrimeMessagesRef = useRef(false);

    const dismissToast = useCallback((id: string) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback(
        (title: string, message: string, type: MessageType = "info") => {
            const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            setToasts((current) => [...current, { id, title, message, type }].slice(-3));
            setTimeout(() => {
                dismissToast(id);
            }, 3500);
        },
        [dismissToast]
    );

    const refreshProfile = useCallback(
        async (_options?: RefreshOptions) => {
            if (!token) {
                setProfile(null);
                return null;
            }

            try {
                const data = (await getProfile(token)) as UserProfile;
                setProfile(data);
                return data;
            } catch {
                return null;
            }
        },
        [token]
    );

    const refreshDashboard = useCallback(
        async ({ silent = false }: RefreshOptions = {}) => {
            if (!token) {
                setDashboard(EMPTY_DASHBOARD);
                return null;
            }

            try {
                const data = (await getDashboard(token)) as DashboardData;
                const normalized: DashboardData = {
                    balance: data.balance ?? 0,
                    balanceEur: data.balanceEur ?? 0,
                    balanceUsd: data.balanceUsd ?? 0,
                    recentTransactions: data.recentTransactions ?? [],
                    unreadMessages: data.unreadMessages ?? 0,
                };
                setDashboard(normalized);
                return normalized;
            } catch {
                if (!silent) {
                    showToast("Błąd", "Nie udało się odświeżyć danych konta", "error");
                }
                return null;
            }
        },
        [showToast, token]
    );

    const refreshMessages = useCallback(
        async ({ silent = false, skipToast = false }: RefreshOptions = {}) => {
            if (!token) {
                setMessages([]);
                knownMessageIdsRef.current = new Set();
                didPrimeMessagesRef.current = false;
                return [];
            }

            try {
                const data = (await getMessages(token)) as Message[];
                const nextMessages = Array.isArray(data) ? data : [];
                setMessages(nextMessages);

                const nextIds = new Set(nextMessages.map((message) => message._id));
                if (!didPrimeMessagesRef.current) {
                    knownMessageIdsRef.current = nextIds;
                    didPrimeMessagesRef.current = true;
                    return nextMessages;
                }

                const freshMessages = nextMessages.filter(
                    (message) => !knownMessageIdsRef.current.has(message._id)
                );

                knownMessageIdsRef.current = nextIds;

                if (!skipToast) {
                    freshMessages
                        .slice()
                        .reverse()
                        .forEach((message) => {
                            showToast(
                                message.title,
                                message.content,
                                message.type ?? "info"
                            );
                        });
                }

                return nextMessages;
            } catch {
                if (!silent) {
                    showToast("Błąd", "Nie udało się odświeżyć powiadomień", "error");
                }
                return [];
            }
        },
        [showToast, token]
    );

    const authenticate = useCallback(
        async (nextToken: string) => {
            await saveToken(nextToken);
            setToken(nextToken);
        },
        []
    );

    const clearSession = useCallback(async () => {
        await removeToken();
        setToken(null);
        setProfile(null);
        setDashboard(EMPTY_DASHBOARD);
        setMessages([]);
        knownMessageIdsRef.current = new Set();
        didPrimeMessagesRef.current = false;
    }, []);

    const toggleSensitiveData = useCallback(() => {
        setShowSensitiveData((current) => !current);
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

    useEffect(() => {
        if (!token) {
            return;
        }

        Promise.all([
            refreshProfile(),
            refreshDashboard({ silent: true }),
            refreshMessages({ silent: true, skipToast: true }),
        ]);
    }, [refreshDashboard, refreshMessages, refreshProfile, token]);

    useEffect(() => {
        if (!token) {
            return;
        }

        const subscription = AppState.addEventListener("change", (nextState) => {
            const becameActive =
                appStateRef.current.match(/inactive|background/) &&
                nextState === "active";

            appStateRef.current = nextState;

            if (becameActive) {
                refreshDashboard({ silent: true });
                refreshMessages({ silent: true });
                refreshProfile({ silent: true });
            }
        });

        const interval = setInterval(() => {
            if (appStateRef.current === "active") {
                refreshDashboard({ silent: true });
                refreshMessages({ silent: true });
            }
        }, 12000);

        return () => {
            subscription.remove();
            clearInterval(interval);
        };
    }, [refreshDashboard, refreshMessages, refreshProfile, token]);

    const value = useMemo<AppContextValue>(
        () => ({
            token,
            profile,
            dashboard,
            messages,
            unreadMessages:
                messages.filter((message) => !message.read).length ||
                dashboard.unreadMessages,
            toasts,
            isReady,
            showSensitiveData,
            authenticate,
            clearSession,
            refreshProfile,
            refreshDashboard,
            refreshMessages,
            showToast,
            dismissToast,
            toggleSensitiveData,
        }),
        [
            authenticate,
            clearSession,
            dashboard,
            dismissToast,
            isReady,
            messages,
            profile,
            refreshDashboard,
            refreshMessages,
            refreshProfile,
            showSensitiveData,
            showToast,
            toasts,
            token,
        ]
    );

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
    const context = useContext(AppContext);

    if (!context) {
        throw new Error("useAppState must be used within AppProvider");
    }

    return context;
}
