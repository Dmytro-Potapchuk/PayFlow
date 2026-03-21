import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { AppState, Platform, type AppStateStatus } from "react-native";
import { io, type Socket } from "socket.io-client";

import { API_URL } from "@/api/api";
import { getToken, removeToken, saveToken } from "@/api/authStorage";
import { getDashboard } from "@/api/dashboard.api";
import {
    clearConversation,
    createDirectConversation,
    deleteConversationMessage,
    getConversationMessages,
    getConversations,
    markConversationRead,
    searchContacts,
    sendConversationMessage,
} from "@/api/messages.api";
import { getProfile } from "@/api/users.api";
import type { DashboardData } from "@/types/dashboard";
import type {
    ChatMessage,
    ContactSearchResult,
    ConversationSummary,
    MessageType,
} from "@/types/message";

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
    conversations: ConversationSummary[];
    activeConversationId: string | null;
    activeConversation: ConversationSummary | null;
    activeMessages: ChatMessage[];
    unreadMessages: number;
    toasts: Toast[];
    isReady: boolean;
    isSocketConnected: boolean;
    showSensitiveData: boolean;
    authenticate: (nextToken: string) => Promise<void>;
    clearSession: () => Promise<void>;
    refreshProfile: (options?: RefreshOptions) => Promise<UserProfile | null>;
    refreshDashboard: (options?: RefreshOptions) => Promise<DashboardData | null>;
    refreshConversations: (
        options?: RefreshOptions
    ) => Promise<ConversationSummary[]>;
    refreshConversationMessages: (
        conversationId: string,
        options?: RefreshOptions
    ) => Promise<ChatMessage[]>;
    refreshMessages: (options?: RefreshOptions) => Promise<ChatMessage[]>;
    openConversation: (
        conversationId: string,
        options?: { markRead?: boolean }
    ) => Promise<void>;
    createConversation: (login: string) => Promise<ConversationSummary | null>;
    sendConversation: (
        conversationId: string,
        content: string,
        title?: string
    ) => Promise<ChatMessage | null>;
    searchConversationContacts: (
        query: string
    ) => Promise<ContactSearchResult[]>;
    markConversationAsRead: (conversationId: string) => Promise<void>;
    clearConversationThread: (conversationId: string) => Promise<void>;
    deleteConversationItem: (messageId: string) => Promise<void>;
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
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(
        null
    );
    const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([]);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [isReady, setIsReady] = useState(false);
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const [showSensitiveData, setShowSensitiveData] = useState(false);
    const appStateRef = useRef<AppStateStatus>(AppState.currentState ?? "active");
    const socketRef = useRef<Socket | null>(null);
    const activeConversationRef = useRef<string | null>(null);
    const conversationSnapshotRef = useRef<
        Record<string, { preview: string; unreadCount: number; lastMessageAt?: string }>
    >({});
    const didPrimeConversationsRef = useRef(false);

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

    const refreshConversations = useCallback(
        async ({ silent = false, skipToast = false }: RefreshOptions = {}) => {
            if (!token) {
                setConversations([]);
                conversationSnapshotRef.current = {};
                didPrimeConversationsRef.current = false;
                return [];
            }

            try {
                const data = (await getConversations(
                    token
                )) as ConversationSummary[];
                const nextConversations = Array.isArray(data) ? data : [];
                const previousSnapshot = conversationSnapshotRef.current;

                setConversations(nextConversations);

                if (
                    activeConversationRef.current &&
                    !nextConversations.some(
                        (conversation) =>
                            conversation._id === activeConversationRef.current
                    )
                ) {
                    setActiveConversationId(null);
                    setActiveMessages([]);
                }

                if (!didPrimeConversationsRef.current) {
                    didPrimeConversationsRef.current = true;
                } else if (!skipToast) {
                    nextConversations.forEach((conversation) => {
                        const previous = previousSnapshot[conversation._id];
                        if (
                            previous &&
                            conversation.unreadCount > previous.unreadCount &&
                            conversation.preview !== previous.preview
                        ) {
                            showToast(
                                conversation.title,
                                conversation.preview,
                                conversation.lastMessageType ?? "info"
                            );
                        }
                    });
                }

                conversationSnapshotRef.current = nextConversations.reduce<
                    Record<
                        string,
                        {
                            preview: string;
                            unreadCount: number;
                            lastMessageAt?: string;
                        }
                    >
                >((accumulator, conversation) => {
                    accumulator[conversation._id] = {
                        preview: conversation.preview,
                        unreadCount: conversation.unreadCount,
                        lastMessageAt: conversation.lastMessageAt,
                    };
                    return accumulator;
                }, {});

                return nextConversations;
            } catch {
                if (!silent) {
                    showToast(
                        "Błąd",
                        "Nie udało się odświeżyć rozmów",
                        "error"
                    );
                }
                return [];
            }
        },
        [showToast, token]
    );

    const refreshConversationMessages = useCallback(
        async (
            conversationId: string,
            { silent = false }: RefreshOptions = {}
        ) => {
            if (!token || !conversationId) {
                setActiveMessages([]);
                return [];
            }

            try {
                const data = (await getConversationMessages(
                    conversationId,
                    token
                )) as ChatMessage[];
                const nextMessages = Array.isArray(data) ? data : [];
                setActiveMessages(nextMessages);
                return nextMessages;
            } catch {
                if (!silent) {
                    showToast("Błąd", "Nie udało się odświeżyć czatu", "error");
                }
                return [];
            }
        },
        [showToast, token]
    );

    const markConversationAsRead = useCallback(
        async (conversationId: string) => {
            if (!token || !conversationId) {
                return;
            }

            await markConversationRead(conversationId, token);
            await refreshConversations({ silent: true, skipToast: true });
        },
        [refreshConversations, token]
    );

    const openConversation = useCallback(
        async (
            conversationId: string,
            options: { markRead?: boolean } = { markRead: true }
        ) => {
            setActiveConversationId(conversationId);
            activeConversationRef.current = conversationId;
            await refreshConversationMessages(conversationId, { silent: true });

            if (options.markRead !== false) {
                await markConversationAsRead(conversationId);
            }
        },
        [markConversationAsRead, refreshConversationMessages]
    );

    const createConversation = useCallback(
        async (login: string) => {
            if (!token) {
                return null;
            }

            const conversation = (await createDirectConversation(
                login,
                token
            )) as ConversationSummary;

            await refreshConversations({ silent: true, skipToast: true });

            return conversation;
        },
        [refreshConversations, token]
    );

    const sendConversation = useCallback(
        async (conversationId: string, content: string, title?: string) => {
            if (!token) {
                return null;
            }

            const message = (await sendConversationMessage(
                conversationId,
                content,
                token,
                title
            )) as ChatMessage;

            await Promise.all([
                refreshConversationMessages(conversationId, { silent: true }),
                refreshConversations({ silent: true, skipToast: true }),
            ]);

            return message;
        },
        [refreshConversationMessages, refreshConversations, token]
    );

    const searchConversationContacts = useCallback(
        async (query: string) => {
            if (!token) {
                return [];
            }

            const data = (await searchContacts(
                query,
                token
            )) as ContactSearchResult[];

            return Array.isArray(data) ? data : [];
        },
        [token]
    );

    const clearConversationThread = useCallback(
        async (conversationId: string) => {
            if (!token) {
                return;
            }

            await clearConversation(conversationId, token);
            await Promise.all([
                refreshConversationMessages(conversationId, { silent: true }),
                refreshConversations({ silent: true, skipToast: true }),
            ]);
        },
        [refreshConversationMessages, refreshConversations, token]
    );

    const deleteConversationItem = useCallback(
        async (messageId: string) => {
            if (!token) {
                return;
            }

            await deleteConversationMessage(messageId, token);

            const currentConversationId = activeConversationRef.current;

            if (currentConversationId) {
                await Promise.all([
                    refreshConversationMessages(currentConversationId, {
                        silent: true,
                    }),
                    refreshConversations({ silent: true, skipToast: true }),
                ]);
            } else {
                await refreshConversations({ silent: true, skipToast: true });
            }
        },
        [refreshConversationMessages, refreshConversations, token]
    );

    const refreshMessages = useCallback(
        async (options?: RefreshOptions) => {
            await refreshConversations(options);

            if (activeConversationRef.current) {
                return refreshConversationMessages(activeConversationRef.current, {
                    silent: true,
                });
            }

            return [];
        },
        [refreshConversationMessages, refreshConversations]
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
        setConversations([]);
        setActiveConversationId(null);
        setActiveMessages([]);
        conversationSnapshotRef.current = {};
        didPrimeConversationsRef.current = false;
        activeConversationRef.current = null;
        socketRef.current?.disconnect();
        socketRef.current = null;
        setIsSocketConnected(false);
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
            refreshConversations({ silent: true, skipToast: true }),
        ]).catch(() => null);
    }, [refreshConversations, refreshDashboard, refreshProfile, token]);

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
                refreshConversations({ silent: true, skipToast: true });
                refreshProfile({ silent: true });
                if (activeConversationRef.current) {
                    refreshConversationMessages(activeConversationRef.current, {
                        silent: true,
                    }).catch(() => null);
                }
            }
        });

        return () => {
            subscription.remove();
        };
    }, [
        refreshConversationMessages,
        refreshConversations,
        refreshDashboard,
        refreshProfile,
        token,
    ]);

    useEffect(() => {
        if (!token) {
            return;
        }

        const socket = io(`${API_URL}/messages`, {
            transports:
                Platform.OS === "web"
                    ? ["polling"]
                    : ["websocket", "polling"],
            auth: {
                token,
            },
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            setIsSocketConnected(true);

            if (activeConversationRef.current) {
                socket.emit("messages:join-conversation", {
                    conversationId: activeConversationRef.current,
                });
            }
        });

        socket.on("disconnect", () => {
            setIsSocketConnected(false);
        });

        socket.on(
            "messages:conversation-updated",
            async (payload: {
                conversationId: string;
                action: "created" | "message" | "read" | "deleted" | "cleared";
            }) => {
                try {
                    await refreshConversations({ silent: true });

                    if (payload.conversationId === activeConversationRef.current) {
                        await refreshConversationMessages(payload.conversationId, {
                            silent: true,
                        });

                        if (payload.action === "message") {
                            await markConversationAsRead(payload.conversationId);
                        }
                    }
                } catch {
                    // Swallow background sync errors to avoid noisy mobile web logs.
                }
            }
        );

        return () => {
            socket.disconnect();
            socketRef.current = null;
            setIsSocketConnected(false);
        };
    }, [
        markConversationAsRead,
        refreshConversationMessages,
        refreshConversations,
        token,
    ]);

    useEffect(() => {
        activeConversationRef.current = activeConversationId;

        const socket = socketRef.current;

        if (!socket || !socket.connected) {
            return;
        }

        if (activeConversationId) {
            socket.emit("messages:join-conversation", {
                conversationId: activeConversationId,
            });
        }

        return () => {
            if (activeConversationId) {
                socket.emit("messages:leave-conversation", {
                    conversationId: activeConversationId,
                });
            }
        };
    }, [activeConversationId]);

    const activeConversation = useMemo(
        () =>
            conversations.find(
                (conversation) => conversation._id === activeConversationId
            ) ?? null,
        [activeConversationId, conversations]
    );

    const value = useMemo<AppContextValue>(
        () => ({
            token,
            profile,
            dashboard,
            conversations,
            activeConversationId,
            activeConversation,
            activeMessages,
            unreadMessages:
                conversations.length > 0
                    ? conversations.reduce(
                          (sum, conversation) => sum + conversation.unreadCount,
                          0
                      )
                    : didPrimeConversationsRef.current
                      ? 0
                      : dashboard.unreadMessages,
            toasts,
            isReady,
            isSocketConnected,
            showSensitiveData,
            authenticate,
            clearSession,
            refreshProfile,
            refreshDashboard,
            refreshConversations,
            refreshConversationMessages,
            refreshMessages,
            openConversation,
            createConversation,
            sendConversation,
            searchConversationContacts,
            markConversationAsRead,
            clearConversationThread,
            deleteConversationItem,
            showToast,
            dismissToast,
            toggleSensitiveData,
        }),
        [
            activeConversation,
            activeConversationId,
            activeMessages,
            authenticate,
            clearSession,
            conversations,
            createConversation,
            dashboard,
            deleteConversationItem,
            dismissToast,
            isReady,
            isSocketConnected,
            markConversationAsRead,
            openConversation,
            profile,
            refreshConversationMessages,
            refreshConversations,
            refreshDashboard,
            refreshMessages,
            refreshProfile,
            searchConversationContacts,
            sendConversation,
            showSensitiveData,
            showToast,
            toasts,
            token,
            clearConversationThread,
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
