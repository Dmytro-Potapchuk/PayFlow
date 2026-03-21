import { useEffect } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import ChatConversationView from "@/components/messages/ChatConversationView";
import { theme } from "@/constants/theme";
import { useAppState } from "@/providers/AppProvider";

export default function ChatScreen() {
    const params = useLocalSearchParams<{ conversationId?: string }>();
    const conversationId =
        typeof params.conversationId === "string" ? params.conversationId : "";
    const {
        activeConversation,
        activeConversationId,
        activeMessages,
        clearConversationThread,
        deleteConversationItem,
        isSocketConnected,
        openConversation,
        sendConversation,
    } = useAppState();

    useEffect(() => {
        if (!conversationId) {
            return;
        }

        openConversation(conversationId, { markRead: true });
    }, [conversationId, openConversation]);

    return (
        <SafeAreaView style={styles.safe}>
            <ChatConversationView
                conversation={
                    activeConversationId === conversationId
                        ? activeConversation
                        : null
                }
                messages={activeConversationId === conversationId ? activeMessages : []}
                isWide={false}
                isSocketConnected={isSocketConnected}
                onBack={() => router.back()}
                onSend={async (content) => {
                    if (!conversationId) {
                        return;
                    }
                    await sendConversation(conversationId, content);
                }}
                onDeleteMessage={deleteConversationItem}
                onClearConversation={async () => {
                    if (!conversationId) {
                        return;
                    }
                    await clearConversationThread(conversationId);
                }}
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
