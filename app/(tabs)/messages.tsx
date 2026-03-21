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
import { useAppState } from "@/providers/AppProvider";
import { theme } from "@/constants/theme";
import type { ContactSearchResult } from "@/types/message";

export default function MessagesScreen() {
    const [listSearch, setListSearch] = useState("");
    const [isComposerOpen, setIsComposerOpen] = useState(false);
    const [contactQuery, setContactQuery] = useState("");
    const [contactResults, setContactResults] = useState<ContactSearchResult[]>([]);
    const [contactLoading, setContactLoading] = useState(false);
    const { width } = useWindowDimensions();
    const isWide = width >= 960;
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
        showToast,
    } = useAppState();

    useFocusEffect(
        useCallback(() => {
            refreshConversations({ silent: true, skipToast: true });
        }, [refreshConversations])
    );

    useEffect(() => {
        if (isWide && !activeConversationId && conversations.length > 0) {
            openConversation(conversations[0]._id, { markRead: true });
        }
    }, [activeConversationId, conversations, isWide, openConversation]);

    useEffect(() => {
        if (!isComposerOpen) {
            return;
        }

        let cancelled = false;

        const timeout = setTimeout(async () => {
            setContactLoading(true);
            try {
                const results = await searchConversationContacts(contactQuery);
                if (!cancelled) {
                    setContactResults(results);
                }
            } catch {
                if (!cancelled) {
                    setContactResults([]);
                    showToast(
                        "Błąd",
                        "Nie udało się wyszukać kontaktów",
                        "error"
                    );
                }
            } finally {
                if (!cancelled) {
                    setContactLoading(false);
                }
            }
        }, 200);

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

    const handleOpenConversation = async (conversationId: string) => {
        await openConversation(conversationId, { markRead: true });

        if (!isWide) {
            router.push({
                pathname: "/chat/[conversationId]",
                params: { conversationId },
            });
        }
    };

    const handleCreateConversation = async (contact: ContactSearchResult) => {
        try {
            const conversation = await createConversation(contact.login);

            if (!conversation) {
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
        } catch {
            showToast("Błąd", "Nie udało się utworzyć rozmowy", "error");
        }
    };

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
                            onSend={async (content) => {
                                if (!activeConversation) {
                                    return;
                                }
                                await sendConversation(activeConversation._id, content);
                            }}
                            onDeleteMessage={deleteConversationItem}
                            onClearConversation={async () => {
                                if (!activeConversation) {
                                    return;
                                }
                                await clearConversationThread(activeConversation._id);
                            }}
                        />
                    </View>
                ) : null}
            </View>
            <NewConversationModal
                visible={isComposerOpen}
                query={contactQuery}
                onChangeQuery={setContactQuery}
                onClose={() => {
                    setIsComposerOpen(false);
                    setContactQuery("");
                }}
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
