import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

import { getToken } from "@/api/authStorage";
import {
    readMessage,
    sendMessage,
} from "@/api/messages.api";
import AppButton from "@/components/AppButton";
import AppInput from "@/components/AppInput";
import { theme } from "@/constants/theme";
import { keyboardShouldPersistTaps } from "@/constants/keyboard";
import { useAppState } from "@/providers/AppProvider";
import type { Message } from "@/types/message";

export default function MessagesScreen() {
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [sending, setSending] = useState(false);
    const [toLogin, setToLogin] = useState("");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const { messages, refreshMessages, showToast } = useAppState();

    const loadMessages = useCallback(async (showErrors = true) => {
        try {
            setLoading(true);
            await refreshMessages({ silent: !showErrors, skipToast: true });
        } catch {
            if (showErrors) {
                showToast("Błąd", "Nie udało się pobrać wiadomości", "error");
            }
        } finally {
            setLoading(false);
        }
    }, [refreshMessages, showToast]);

    useFocusEffect(
        useCallback(() => {
            loadMessages(false);
        }, [loadMessages])
    );

    const handleSend = async () => {
        if (!toLogin || !title || !content) {
            showToast("Błąd", "Adresat, tytuł i treść są wymagane", "error");
            return;
        }

        try {
            setSending(true);
            const token = await getToken();
            if (!token) {
                showToast("Błąd", "Użytkownik nie jest zalogowany", "error");
                return;
            }

            await sendMessage(toLogin, title, content, token);
            await refreshMessages({ silent: true, skipToast: true });
            setToLogin("");
            setTitle("");
            setContent("");
            showToast("Sukces", "Wiadomość wysłana", "success");
        } catch {
            showToast("Błąd", "Nie udało się wysłać wiadomości", "error");
        } finally {
            setSending(false);
        }
    };

    const handleToggleMessage = async (item: Message) => {
        const newExpanded = expandedId === item._id ? null : item._id;
        setExpandedId(newExpanded);

        if (!item.read && newExpanded) {
            try {
                const token = await getToken();
                if (!token) return;
                await readMessage(item._id, token);
                await refreshMessages({ silent: true, skipToast: true });
            } catch {
                // ignore
            }
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await refreshMessages({ silent: true, skipToast: true });
        setRefreshing(false);
    };

    const getTypeColor = (type?: Message["type"]) => {
        if (type === "success") {
            return theme.colors.success;
        }
        if (type === "error") {
            return theme.colors.error;
        }
        return theme.colors.info;
    };

    const renderItem = ({ item }: { item: Message }) => {
        const isExpanded = expandedId === item._id;
        return (
            <TouchableOpacity
                style={[
                    styles.messageCard,
                    !item.read && styles.unreadCard,
                ]}
                onPress={() => handleToggleMessage(item)}
                activeOpacity={0.8}
            >
                <View style={styles.messageHeader}>
                    <View style={styles.messageMain}>
                        <Text style={styles.messageTitle}>{item.title}</Text>
                        {item.senderLogin && (
                            <Text style={styles.messageSender}>
                                Od: {item.senderLogin}
                            </Text>
                        )}
                    </View>
                    <View style={styles.badges}>
                        <View
                            style={[
                                styles.typeBadge,
                                { backgroundColor: `${getTypeColor(item.type)}18` },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.typeBadgeText,
                                    { color: getTypeColor(item.type) },
                                ]}
                            >
                                {(item.type ?? "info").toUpperCase()}
                            </Text>
                        </View>
                        {!item.read && (
                            <View style={styles.unreadBadge}>
                                <Text style={styles.unreadText}>NOWA</Text>
                            </View>
                        )}
                    </View>
                </View>
                {item.createdAt && (
                    <Text style={styles.messageDate}>
                        {new Date(item.createdAt).toLocaleString()}
                    </Text>
                )}
                {isExpanded && (
                    <Text style={styles.messageContent}>{item.content}</Text>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Wiadomości</Text>
                    <Text style={styles.subtitle}>Komunikacja z użytkownikami</Text>
                </View>

                <View style={styles.formCard}>
                    <Text style={styles.sectionTitle}>Nowa wiadomość</Text>
                    <AppInput
                        placeholder="Login odbiorcy"
                        value={toLogin}
                        onChangeText={setToLogin}
                        autoCapitalize="none"
                    />
                    <AppInput
                        placeholder="Tytuł"
                        value={title}
                        onChangeText={setTitle}
                    />
                    <TextInput
                        style={[styles.input, styles.textarea]}
                        placeholder="Treść wiadomości"
                        placeholderTextColor={theme.colors.textMuted}
                        multiline
                        numberOfLines={4}
                        value={content}
                        onChangeText={setContent}
                    />
                    <AppButton
                        title={sending ? "Wysyłanie..." : "Wyślij"}
                        onPress={handleSend}
                        loading={sending}
                        disabled={sending}
                    />
                </View>

                <Text style={styles.sectionTitle}>Twoje wiadomości</Text>

                {loading ? (
                    <ActivityIndicator
                        size="large"
                        color={theme.colors.primary}
                        style={styles.loader}
                    />
                ) : (
                    <FlatList
                        data={messages}
                        keyExtractor={(item) => item._id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <Text style={styles.empty}>Brak wiadomości</Text>
                        }
                        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
                        keyboardDismissMode="on-drag"
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[theme.colors.primary]}
                            />
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    container: { flex: 1, padding: theme.spacing.lg },
    header: { marginBottom: theme.spacing.lg },
    title: {
        ...theme.typography.h1,
        color: theme.colors.text,
    },
    subtitle: {
        ...theme.typography.bodySmall,
        color: theme.colors.textMuted,
        marginTop: 4,
    },
    formCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
        ...theme.shadows.md,
    },
    sectionTitle: {
        ...theme.typography.h3,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    input: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.md,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    textarea: {
        height: 100,
        textAlignVertical: "top",
    },
    listContent: { paddingBottom: 24 },
    messageCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        ...theme.shadows.sm,
    },
    unreadCard: {
        borderWidth: 1,
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.border,
    },
    messageHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: theme.spacing.sm,
    },
    messageMain: {
        flex: 1,
    },
    badges: {
        alignItems: "flex-end",
        gap: theme.spacing.xs,
    },
    messageTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: theme.colors.text,
    },
    messageSender: {
        fontSize: 12,
        color: theme.colors.textMuted,
        marginTop: 2,
    },
    typeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: theme.radius.full,
    },
    typeBadgeText: {
        fontSize: 10,
        fontWeight: "700",
    },
    unreadBadge: {
        backgroundColor: theme.colors.error,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: theme.radius.full,
    },
    unreadText: {
        fontSize: 11,
        color: "#fff",
        fontWeight: "600",
    },
    messageDate: {
        fontSize: 12,
        color: theme.colors.textMuted,
        marginTop: 4,
    },
    messageContent: {
        fontSize: 14,
        color: theme.colors.text,
        marginTop: 8,
        lineHeight: 20,
    },
    empty: {
        textAlign: "center",
        color: theme.colors.textMuted,
        marginTop: theme.spacing.xl,
    },
    loader: { marginTop: theme.spacing.xl },
});
