import { useCallback, useEffect } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import ChatConversationView from "@/components/messages/ChatConversationView";
import { theme } from "@/constants/theme";
import { useMessages, useToast } from "@/providers/AppProvider";
import { getErrorMessage } from "@/utils/errorMessage";
import { logError } from "@/utils/logError";

function resolveConversationId(
    raw: string | string[] | undefined
): string | null {
    if (typeof raw !== "string") {
        return null;
    }

    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export default function ChatScreen() {
    const params = useLocalSearchParams<{ conversationId?: string }>();
    const conversationId = resolveConversationId(params.conversationId);
    const {
        activeConversation,
        activeConversationId,
        activeMessages,
        clearConversationThread,
        deleteConversationItem,
        isSocketConnected,
        openConversation,
        sendConversation,
    } = useMessages();
    const { showToast } = useToast();

    const navigateToMessages = useCallback(() => {
        router.replace("/(tabs)/messages");
    }, []);

    const bootstrapConversation = useCallback(async () => {
        if (!conversationId) {
            showToast("Błąd", "Nieprawidłowy identyfikator rozmowy", "error");
            navigateToMessages();
            return;
        }

        try {
            await openConversation(conversationId, { markRead: true });
        } catch (error: unknown) {
            logError("chat.openConversation", error);
            showToast(
                "Błąd",
                getErrorMessage(error, "Nie udało się otworzyć rozmowy"),
                "error"
            );
            navigateToMessages();
        }
    }, [conversationId, navigateToMessages, openConversation, showToast]);

    useEffect(() => {
        bootstrapConversation();
    }, [bootstrapConversation]);

    const handleSend = useCallback(
        async (content: string) => {
            if (!conversationId) {
                return;
            }

            try {
                await sendConversation(conversationId, content);
            } catch (error: unknown) {
                logError("chat.sendConversation", error);
                showToast(
                    "Błąd",
                    getErrorMessage(error, "Nie udało się wysłać wiadomości"),
                    "error"
                );
            }
        },
        [conversationId, sendConversation, showToast]
    );

    const handleClearConversation = useCallback(async () => {
        if (!conversationId) {
            return;
        }

        try {
            await clearConversationThread(conversationId);
            showToast("Sukces", "Historia rozmowy została wyczyszczona", "success");
        } catch (error: unknown) {
            logError("chat.clearConversation", error);
            showToast(
                "Błąd",
                getErrorMessage(error, "Nie udało się wyczyścić rozmowy"),
                "error"
            );
        }
    }, [clearConversationThread, conversationId, showToast]);

    if (!conversationId) {
        return null;
    }

    return (
        <SafeAreaView style={styles.safe}>
            <ChatConversationView
                conversation={
                    activeConversationId === conversationId
                        ? activeConversation
                        : null
                }
                messages={
                    activeConversationId === conversationId ? activeMessages : []
                }
                isWide={false}
                isSocketConnected={isSocketConnected}
                onBack={() => router.back()}
                onSend={handleSend}
                onDeleteMessage={deleteConversationItem}
                onClearConversation={handleClearConversation}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.lg,
    },
});
