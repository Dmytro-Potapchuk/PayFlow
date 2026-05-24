import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type MutableRefObject,
    type ReactNode,
} from "react";
import { AppState, Platform, type AppStateStatus } from "react-native";
import { io, type Socket } from "socket.io-client";

import { API_URL } from "@/api/api";
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
import type {
    ChatMessage,
    ContactSearchResult,
    ConversationSummary,
} from "@/types/message";

import { buildConversationSnapshot } from "./conversationSnapshot";
import { useDashboardContext } from "./DashboardProvider";
import { useSessionContext, useSessionToken } from "./SessionProvider";
import { useToastContext } from "./ToastProvider";
import type { ConversationSnapshotMap, RefreshOptions } from "./types";

type ConversationUpdatedPayload = {
    conversationId: string;
    action: "created" | "message" | "read" | "deleted" | "cleared";
};

type MessagesContextValue = {
    conversations: ConversationSummary[];
    activeConversationId: string | null;
    activeConversation: ConversationSummary | null;
    activeMessages: ChatMessage[];
    unreadMessages: number;
    isSocketConnected: boolean;
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
};

const MessagesContext = createContext<MessagesContextValue | undefined>(undefined);

function resetMessagesState(
    setConversations: (value: ConversationSummary[]) => void,
    setActiveConversationId: (value: string | null) => void,
    setActiveMessages: (value: ChatMessage[]) => void,
    conversationSnapshotRef: MutableRefObject<ConversationSnapshotMap>,
    didPrimeConversationsRef: MutableRefObject<boolean>,
    activeConversationRef: MutableRefObject<string | null>
) {
    setConversations([]);
    setActiveConversationId(null);
    setActiveMessages([]);
    conversationSnapshotRef.current = {};
    didPrimeConversationsRef.current = false;
    activeConversationRef.current = null;
}

export function MessagesProvider({ children }: { children: ReactNode }) {
    const token = useSessionToken();
    const { isAuthenticated } = useSessionContext();
    const { showToast } = useToastContext();
    const { dashboard } = useDashboardContext();

    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(
        null
    );
    const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([]);
    const [isSocketConnected, setIsSocketConnected] = useState(false);

    const appStateRef = useRef<AppStateStatus>(AppState.currentState ?? "active");
    const socketRef = useRef<Socket | null>(null);
    const activeConversationRef = useRef<string | null>(null);
    const conversationSnapshotRef = useRef<ConversationSnapshotMap>({});
    const didPrimeConversationsRef = useRef(false);

    const refreshConversations = useCallback(
        async ({ silent = false, skipToast = false }: RefreshOptions = {}) => {
            if (!token) {
                resetMessagesState(
                    setConversations,
                    setActiveConversationId,
                    setActiveMessages,
                    conversationSnapshotRef,
                    didPrimeConversationsRef,
                    activeConversationRef
                );
                return [];
            }

            try {
                const data = await getConversations(token);
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
                    activeConversationRef.current = null;
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

                conversationSnapshotRef.current =
                    buildConversationSnapshot(nextConversations);

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
                const data = await getConversationMessages(conversationId, token);
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

            const conversation = await createDirectConversation(login, token);
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

            const message = await sendConversationMessage(
                conversationId,
                content,
                token,
                title
            );

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

            const data = await searchContacts(query, token);
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

    useEffect(() => {
        if (!isAuthenticated) {
            resetMessagesState(
                setConversations,
                setActiveConversationId,
                setActiveMessages,
                conversationSnapshotRef,
                didPrimeConversationsRef,
                activeConversationRef
            );
            socketRef.current?.disconnect();
            socketRef.current = null;
            setIsSocketConnected(false);
            return;
        }

        refreshConversations({ silent: true, skipToast: true }).catch(() => null);
    }, [isAuthenticated, refreshConversations]);

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
                refreshConversations({ silent: true, skipToast: true }).catch(
                    () => null
                );
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
    }, [refreshConversationMessages, refreshConversations, token]);

    useEffect(() => {
        if (!token) {
            return;
        }

        const socket = io(`${API_URL}/messages`, {
            transports:
                Platform.OS === "web" ? ["polling"] : ["websocket", "polling"],
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
            async (payload: ConversationUpdatedPayload) => {
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

    const unreadMessages = useMemo(() => {
        if (conversations.length > 0) {
            return conversations.reduce(
                (sum, conversation) => sum + conversation.unreadCount,
                0
            );
        }

        return didPrimeConversationsRef.current ? 0 : dashboard.unreadMessages;
    }, [conversations, dashboard.unreadMessages]);

    const value = useMemo<MessagesContextValue>(
        () => ({
            conversations,
            activeConversationId,
            activeConversation,
            activeMessages,
            unreadMessages,
            isSocketConnected,
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
        }),
        [
            activeConversation,
            activeConversationId,
            activeMessages,
            clearConversationThread,
            conversations,
            createConversation,
            deleteConversationItem,
            isSocketConnected,
            markConversationAsRead,
            openConversation,
            refreshConversationMessages,
            refreshConversations,
            refreshMessages,
            searchConversationContacts,
            sendConversation,
            unreadMessages,
        ]
    );

    return (
        <MessagesContext.Provider value={value}>
            {children}
        </MessagesContext.Provider>
    );
}

export function useMessagesContext(): MessagesContextValue {
    const context = useContext(MessagesContext);

    if (!context) {
        throw new Error("useMessagesContext must be used within MessagesProvider");
    }

    return context;
}
