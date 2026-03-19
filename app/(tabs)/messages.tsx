import {
    View,
    Text,
    TextInput,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    SafeAreaView,
} from "react-native";
import { useEffect, useState } from "react";

import { getToken } from "@/api/authStorage";
import {
    getMessages,
    sendMessage,
    readMessage,
} from "@/api/messages.api";
import AppButton from "@/components/AppButton";
import AppInput from "@/components/AppInput";
import { theme } from "@/constants/theme";

interface Message {
    _id: string;
    title: string;
    content: string;
    read: boolean;
    senderLogin?: string;
    createdAt?: string;
}

export default function MessagesScreen() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [toLogin, setToLogin] = useState("");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            if (!token) {
                Alert.alert("Błąd", "Użytkownik nie jest zalogowany");
                return;
            }
            const data = await getMessages(token);
            setMessages(data);
        } catch {
            Alert.alert("Błąd", "Nie udało się pobrać wiadomości");
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!toLogin || !title || !content) {
            Alert.alert("Błąd", "Adresat, tytuł i treść są wymagane");
            return;
        }

        try {
            setSending(true);
            const token = await getToken();
            if (!token) {
                Alert.alert("Błąd", "Użytkownik nie jest zalogowany");
                return;
            }

            const msg = await sendMessage(toLogin, title, content, token);
            setMessages((prev) => [msg, ...prev]);
            setToLogin("");
            setTitle("");
            setContent("");
            Alert.alert("Sukces", "Wiadomość wysłana");
        } catch {
            Alert.alert("Błąd", "Nie udało się wysłać wiadomości");
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
                setMessages((prev) =>
                    prev.map((m) =>
                        m._id === item._id ? { ...m, read: true } : m
                    )
                );
            } catch {
                // ignore
            }
        }
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
                    <View>
                        <Text style={styles.messageTitle}>{item.title}</Text>
                        {item.senderLogin && (
                            <Text style={styles.messageSender}>
                                Od: {item.senderLogin}
                            </Text>
                        )}
                    </View>
                    {!item.read && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadText}>NOWA</Text>
                        </View>
                    )}
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
                        keyboardShouldPersistTaps="never"
                        keyboardDismissMode="on-drag"
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
