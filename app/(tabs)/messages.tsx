import {
    SafeAreaView,
    StyleSheet,
    View,
    useWindowDimensions,
} from "react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";

import ChatConversationView from "@/components/messages/ChatConversationView";
import ConversationListPanel from "@/components/messages/ConversationListPanel";
import NewConversationModal from "@/components/messages/NewConversationModal";
import { isMessagesWideLayout } from "@/constants/layout";
import { useMessages, useToast } from "@/providers/AppProvider";
import { theme } from "@/constants/theme";
import type { ContactSearchResult } from "@/types/message";
import { getErrorMessage } from "@/utils/errorMessage";
import { logError } from "@/utils/logError";

export default function MessagesScreen() {
    const [listSearch, setListSearch] = useState("");
    const [isComposerOpen, setIsComposerOpen] = useState(false);
    const [contactQuery, setContactQuery] = useState("");
    const [contactResults, setContactResults] = useState<ContactSearchResult[]>([]);
    const [contactLoading, setContactLoading] = useState(false);
    const { width } = useWindowDimensions();
    const isWide = isMessagesWideLayout(width);
    const {
        activeConversation,
        activeConversationId,
        activeMessages,
        conversations,
        createConversation,
        deleteConversationItem,
        clearConversationThread,
        isSocketConnected,
        openConversation,
        refreshConversations,
        searchConversationContacts,
        sendConversation,
    } = useMessages();
    const { showToast } = useToast();

    useFocusEffect(
        useCallback(() => {
            refreshConversations({ silent: true, skipToast: true }).catch(
                (error: unknown) => {
                    logError("messages.refreshConversations", error);
                }
            );
        }, [refreshConversations])
    );

    const openFirstConversationOnWideLayout = useCallback(async () => {
        if (!isWide || activeConversationId || conversations.length === 0) {
            return;
        }

        try {
            await openConversation(conversations[0]._id, { markRead: true });
        } catch (error: unknown) {
            logError("messages.openFirstConversation", error);
        }
    }, [activeConversationId, conversations, isWide, openConversation]);

    useEffect(() => {
        openFirstConversationOnWideLayout();
    }, [openFirstConversationOnWideLayout]);

    useEffect(() => {
        if (!isComposerOpen) {
            return;
        }

        let cancelled = false;

        const debounceMs = contactQuery.trim() ? 250 : 0;

        const timeout = setTimeout(async () => {
            setContactLoading(true);
            try {
                const results = await searchConversationContacts(contactQuery);
                if (!cancelled) {
                    setContactResults(results);
                }
            } catch (error: unknown) {
                logError("messages.searchContacts", error);
                if (!cancelled) {
                    setContactResults([]);
                    showToast(
                        "Błąd",
                        getErrorMessage(error, "Nie udało się pobrać listy użytkowników"),
                        "error"
                    );
                }
            } finally {
                if (!cancelled) {
                    setContactLoading(false);
                }
            }
        }, debounceMs);

        return () => {
            cancelled = true;
            clearTimeout(timeout);
        };
    }, [contactQuery, isComposerOpen, searchConversationContacts, showToast]);

    const filteredConversations = useMemo(() => {
        const normalized = listSearch.trim().toLowerCase();

        if (!normalized) {
            return conversations;
        }

        return conversations.filter((conversation) =>
            `${conversation.title} ${conversation.preview}`
                .toLowerCase()
                .includes(normalized)
        );
    }, [conversations, listSearch]);

    const handleOpenConversation = useCallback(
        async (conversationId: string) => {
            try {
                await openConversation(conversationId, { markRead: true });

                if (!isWide) {
                    router.push({
                        pathname: "/chat/[conversationId]",
                        params: { conversationId },
                    });
                }
            } catch (error: unknown) {
                logError("messages.openConversation", error);
                showToast(
                    "Błąd",
                    getErrorMessage(error, "Nie udało się otworzyć rozmowy"),
                    "error"
                );
            }
        },
        [isWide, openConversation, showToast]
    );

    const handleCreateConversation = useCallback(
        async (contact: ContactSearchResult) => {
            try {
                const conversation = await createConversation(contact.login);

                if (!conversation) {
                    showToast("Błąd", "Nie udało się utworzyć rozmowy", "error");
                    return;
                }

                setIsComposerOpen(false);
                setContactQuery("");
                setContactResults([]);
                await openConversation(conversation._id, { markRead: true });

                if (!isWide) {
                    router.push({
                        pathname: "/chat/[conversationId]",
                        params: { conversationId: conversation._id },
                    });
                }
            } catch (error: unknown) {
                logError("messages.createConversation", error);
                showToast(
                    "Błąd",
                    getErrorMessage(error, "Nie udało się utworzyć rozmowy"),
                    "error"
                );
            }
        },
        [createConversation, isWide, openConversation, showToast]
    );

    const handleSendMessage = useCallback(
        async (content: string) => {
            if (!activeConversation) {
                return;
            }

            try {
                await sendConversation(activeConversation._id, content);
            } catch (error: unknown) {
                logError("messages.sendConversation", error);
                showToast(
                    "Błąd",
                    getErrorMessage(error, "Nie udało się wysłać wiadomości"),
                    "error"
                );
            }
        },
        [activeConversation, sendConversation, showToast]
    );

    const handleClearConversation = useCallback(async () => {
        if (!activeConversation) {
            return;
        }

        try {
            await clearConversationThread(activeConversation._id);
            showToast("Sukces", "Historia rozmowy została wyczyszczona", "success");
        } catch (error: unknown) {
            logError("messages.clearConversation", error);
            showToast(
                "Błąd",
                getErrorMessage(error, "Nie udało się wyczyścić rozmowy"),
                "error"
            );
        }
    }, [activeConversation, clearConversationThread, showToast]);

    const closeComposer = useCallback(() => {
        setIsComposerOpen(false);
        setContactQuery("");
        setContactResults([]);
    }, []);

    return (
        <SafeAreaView style={styles.safe}>
            <View style={[styles.container, isWide && styles.containerWide]}>
                <View style={styles.leftPane}>
                    <ConversationListPanel
                        conversations={filteredConversations}
                        selectedConversationId={activeConversationId}
                        searchValue={listSearch}
                        onChangeSearch={setListSearch}
                        onOpenConversation={handleOpenConversation}
                        onOpenComposer={() => setIsComposerOpen(true)}
                        isWide={isWide}
                        isSocketConnected={isSocketConnected}
                    />
                </View>

                {isWide ? (
                    <View style={styles.rightPane}>
                        <ChatConversationView
                            conversation={activeConversation}
                            messages={activeMessages}
                            isWide
                            isSocketConnected={isSocketConnected}
                            onSend={handleSendMessage}
                            onDeleteMessage={deleteConversationItem}
                            onClearConversation={handleClearConversation}
                        />
                    </View>
                ) : null}
            </View>
            <NewConversationModal
                visible={isComposerOpen}
                query={contactQuery}
                onChangeQuery={setContactQuery}
                onClose={closeComposer}
                onSelectContact={handleCreateConversation}
                contacts={contactResults}
                loading={contactLoading}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    container: {
        flex: 1,
        padding: theme.spacing.lg,
        gap: theme.spacing.md,
    },
    containerWide: {
        flexDirection: "row",
    },
    leftPane: {
        flex: 1,
    },
    rightPane: {
        flex: 1.6,
    },
});
