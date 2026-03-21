import { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { theme } from "@/constants/theme";
import type { ChatMessage, ConversationSummary } from "@/types/message";

type Props = {
    conversation: ConversationSummary | null;
    messages: ChatMessage[];
    isWide: boolean;
    isSocketConnected: boolean;
    onBack?: () => void;
    onSend: (content: string) => Promise<void>;
    onDeleteMessage: (messageId: string) => Promise<void>;
    onClearConversation: () => Promise<void>;
};

function formatTimestamp(timestamp?: string) {
    if (!timestamp) {
        return "";
    }

    return new Intl.DateTimeFormat("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(timestamp));
}

function MessageBubble({
    item,
    onDelete,
}: {
    item: ChatMessage;
    onDelete: (messageId: string) => void;
}) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(10)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 180,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 180,
                useNativeDriver: true,
            }),
        ]).start();
    }, [opacity, translateY]);

    return (
        <Animated.View
            style={[
                styles.bubbleRow,
                item.isOwn ? styles.bubbleRowOwn : styles.bubbleRowOther,
                { opacity, transform: [{ translateY }] },
            ]}
        >
            <Pressable
                onLongPress={() => onDelete(item._id)}
                style={[
                    styles.bubble,
                    item.isOwn ? styles.bubbleOwn : styles.bubbleOther,
                ]}
            >
                {item.title ? (
                    <Text
                        style={[
                            styles.bubbleTitle,
                            item.isOwn && styles.bubbleTitleOwn,
                        ]}
                    >
                        {item.title}
                    </Text>
                ) : null}
                <Text
                    style={[
                        styles.bubbleText,
                        item.isOwn && styles.bubbleTextOwn,
                    ]}
                >
                    {item.content}
                </Text>
                <Text
                    style={[
                        styles.bubbleTime,
                        item.isOwn && styles.bubbleTimeOwn,
                    ]}
                >
                    {formatTimestamp(item.createdAt)}
                </Text>
            </Pressable>
        </Animated.View>
    );
}

export default function ChatConversationView({
    conversation,
    messages,
    isWide,
    isSocketConnected,
    onBack,
    onSend,
    onDeleteMessage,
    onClearConversation,
}: Props) {
    const [draft, setDraft] = useState("");
    const [sending, setSending] = useState(false);
    const listRef = useRef<FlatList<ChatMessage>>(null);

    useEffect(() => {
        requestAnimationFrame(() => {
            listRef.current?.scrollToEnd({ animated: true });
        });
    }, [messages.length]);

    const handleSend = async () => {
        const trimmed = draft.trim();
        if (!trimmed) {
            return;
        }

        setSending(true);
        try {
            await onSend(trimmed);
            setDraft("");
        } finally {
            setSending(false);
        }
    };

    const handleDelete = (messageId: string) => {
        Alert.alert(
            "Usuń wiadomość",
            "Czy na pewno chcesz usunąć tę wiadomość z rozmowy?",
            [
                { text: "Anuluj", style: "cancel" },
                {
                    text: "Usuń",
                    style: "destructive",
                    onPress: () => {
                        onDeleteMessage(messageId);
                    },
                },
            ]
        );
    };

    const handleClearConversation = () => {
        Alert.alert(
            "Wyczyść rozmowę",
            "Ta operacja usunie historię rozmowy z Twojego widoku.",
            [
                { text: "Anuluj", style: "cancel" },
                {
                    text: "Wyczyść",
                    style: "destructive",
                    onPress: () => {
                        onClearConversation();
                    },
                },
            ]
        );
    };

    if (!conversation) {
        return (
            <View style={styles.placeholderWrap}>
                <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={32}
                    color={theme.colors.textMuted}
                />
                <Text style={styles.placeholderTitle}>
                    Wybierz rozmowę
                </Text>
                <Text style={styles.placeholderText}>
                    Po lewej stronie znajdziesz listę kontaktów i rozmów.
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, isWide && styles.containerWide]}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    {!isWide && onBack ? (
                        <Pressable style={styles.backButton} onPress={onBack}>
                            <Ionicons
                                name="chevron-back"
                                size={20}
                                color={theme.colors.text}
                            />
                        </Pressable>
                    ) : null}
                    <View>
                        <Text style={styles.headerTitle}>{conversation.title}</Text>
                        <Text style={styles.headerSubtitle}>
                            {isSocketConnected
                                ? "Nowe wiadomości pojawiają się automatycznie"
                                : "Łączenie z serwerem wiadomości"}
                        </Text>
                    </View>
                </View>
                <Pressable
                    style={styles.clearButton}
                    onPress={handleClearConversation}
                >
                    <Ionicons
                        name="trash-outline"
                        size={18}
                        color={theme.colors.textSecondary}
                    />
                </Pressable>
            </View>

            <FlatList
                ref={listRef}
                data={messages}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <MessageBubble item={item} onDelete={handleDelete} />
                )}
                contentContainerStyle={styles.messagesContent}
                ListEmptyComponent={
                    <View style={styles.emptyConversation}>
                        <Text style={styles.emptyConversationTitle}>
                            Brak wiadomości
                        </Text>
                        <Text style={styles.emptyConversationText}>
                            Napisz pierwszą wiadomość i rozpocznij rozmowę.
                        </Text>
                    </View>
                }
            />

            <View style={styles.composer}>
                <TextInput
                    placeholder="Napisz wiadomość..."
                    placeholderTextColor={theme.colors.textMuted}
                    value={draft}
                    onChangeText={setDraft}
                    multiline
                    style={styles.input}
                />
                <Pressable
                    style={[
                        styles.sendButton,
                        (!draft.trim() || sending) && styles.sendButtonDisabled,
                    ]}
                    onPress={handleSend}
                    disabled={!draft.trim() || sending}
                >
                    <Ionicons
                        name="send"
                        size={18}
                        color="#fff"
                    />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.xl,
        padding: theme.spacing.md,
        ...theme.shadows.md,
    },
    containerWide: {
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    placeholderWrap: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: theme.spacing.sm,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.xl,
        padding: theme.spacing.xl,
        ...theme.shadows.md,
    },
    placeholderTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: theme.colors.text,
    },
    placeholderText: {
        fontSize: 14,
        color: theme.colors.textMuted,
        textAlign: "center",
        maxWidth: 280,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.sm,
        flex: 1,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.background,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: theme.colors.text,
    },
    headerSubtitle: {
        fontSize: 12,
        color: theme.colors.textMuted,
        marginTop: 2,
    },
    clearButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.background,
    },
    messagesContent: {
        paddingVertical: theme.spacing.md,
        flexGrow: 1,
    },
    emptyConversation: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: theme.spacing.xl,
        gap: theme.spacing.xs,
    },
    emptyConversationTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: theme.colors.text,
    },
    emptyConversationText: {
        fontSize: 13,
        color: theme.colors.textMuted,
        textAlign: "center",
        maxWidth: 260,
    },
    bubbleRow: {
        flexDirection: "row",
        marginBottom: theme.spacing.sm,
    },
    bubbleRowOwn: {
        justifyContent: "flex-end",
    },
    bubbleRowOther: {
        justifyContent: "flex-start",
    },
    bubble: {
        maxWidth: "78%",
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 4,
        ...theme.shadows.sm,
    },
    bubbleOwn: {
        backgroundColor: theme.colors.primary,
        borderBottomRightRadius: 8,
    },
    bubbleOther: {
        backgroundColor: theme.colors.background,
        borderBottomLeftRadius: 8,
    },
    bubbleTitle: {
        fontSize: 12,
        fontWeight: "700",
        color: theme.colors.primary,
    },
    bubbleTitleOwn: {
        color: "rgba(255,255,255,0.92)",
    },
    bubbleText: {
        fontSize: 15,
        lineHeight: 20,
        color: theme.colors.text,
    },
    bubbleTextOwn: {
        color: "#fff",
    },
    bubbleTime: {
        fontSize: 11,
        color: theme.colors.textMuted,
        alignSelf: "flex-end",
    },
    bubbleTimeOwn: {
        color: "rgba(255,255,255,0.72)",
    },
    composer: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: theme.spacing.sm,
        paddingTop: theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    input: {
        flex: 1,
        minHeight: 48,
        maxHeight: 120,
        borderRadius: theme.radius.xl,
        backgroundColor: theme.colors.background,
        paddingHorizontal: 16,
        paddingVertical: 12,
        color: theme.colors.text,
        fontSize: 15,
    },
    sendButton: {
        width: 46,
        height: 46,
        borderRadius: 23,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.primary,
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
});
