import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { theme } from "@/constants/theme";
import type { ConversationSummary } from "@/types/message";

type Props = {
    conversations: ConversationSummary[];
    selectedConversationId: string | null;
    searchValue: string;
    onChangeSearch: (value: string) => void;
    onOpenConversation: (conversationId: string) => void;
    onOpenComposer: () => void;
    isWide: boolean;
    isSocketConnected: boolean;
};

function formatTimestamp(timestamp?: string) {
    if (!timestamp) {
        return "";
    }

    const date = new Date(timestamp);

    return new Intl.DateTimeFormat("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
    }).format(date);
}

function getInitials(title: string) {
    return title
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
}

export default function ConversationListPanel({
    conversations,
    selectedConversationId,
    searchValue,
    onChangeSearch,
    onOpenConversation,
    onOpenComposer,
    isWide,
    isSocketConnected,
}: Props) {
    return (
        <View style={[styles.container, isWide && styles.containerWide]}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Wiadomości</Text>
                    <Text style={styles.subtitle}>
                        {isSocketConnected
                            ? "Realtime aktywny"
                            : "Łączenie z komunikatorem..."}
                    </Text>
                </View>
                <Pressable
                    style={styles.addButton}
                    onPress={onOpenComposer}
                    accessibilityRole="button"
                    accessibilityLabel="Dodaj nowy czat"
                >
                    <Ionicons name="add" size={22} color="#fff" />
                </Pressable>
            </View>

            <View style={styles.searchWrap}>
                <Ionicons
                    name="search-outline"
                    size={18}
                    color={theme.colors.textMuted}
                />
                <TextInput
                    placeholder="Szukaj czatów lub kontaktów"
                    placeholderTextColor={theme.colors.textMuted}
                    value={searchValue}
                    onChangeText={onChangeSearch}
                    style={styles.searchInput}
                />
            </View>

            <FlatList
                data={conversations}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => {
                    const isSelected = item._id === selectedConversationId;

                    return (
                        <Pressable
                            style={[
                                styles.row,
                                isSelected && isWide && styles.rowSelected,
                            ]}
                            onPress={() => onOpenConversation(item._id)}
                        >
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {getInitials(item.title || "PW")}
                                </Text>
                            </View>
                            <View style={styles.rowContent}>
                                <View style={styles.rowTop}>
                                    <Text style={styles.rowTitle} numberOfLines={1}>
                                        {item.title}
                                    </Text>
                                    <Text style={styles.rowTime}>
                                        {formatTimestamp(item.lastMessageAt)}
                                    </Text>
                                </View>
                                <View style={styles.rowBottom}>
                                    <Text style={styles.preview} numberOfLines={1}>
                                        {item.preview || "Brak wiadomości"}
                                    </Text>
                                    {item.unreadCount > 0 && (
                                        <View style={styles.unreadBadge}>
                                            <Text style={styles.unreadText}>
                                                {item.unreadCount > 9
                                                    ? "9+"
                                                    : item.unreadCount}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </Pressable>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.emptyWrap}>
                        <Ionicons
                            name="chatbubbles-outline"
                            size={28}
                            color={theme.colors.textMuted}
                        />
                        <Text style={styles.emptyTitle}>Brak wiadomości</Text>
                        <Text style={styles.emptyText}>
                            Rozpocznij nową rozmowę przyciskiem plus.
                        </Text>
                    </View>
                }
            />
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
        maxWidth: 360,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: theme.spacing.md,
    },
    title: {
        ...theme.typography.h2,
        color: theme.colors.text,
    },
    subtitle: {
        ...theme.typography.bodySmall,
        color: theme.colors.textMuted,
        marginTop: 2,
    },
    addButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.primary,
        ...theme.shadows.sm,
    },
    searchWrap: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.sm,
        backgroundColor: theme.colors.background,
        borderRadius: theme.radius.full,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginBottom: theme.spacing.md,
    },
    searchInput: {
        flex: 1,
        color: theme.colors.text,
        fontSize: 15,
    },
    listContent: {
        paddingBottom: theme.spacing.md,
        gap: theme.spacing.xs,
    },
    row: {
        flexDirection: "row",
        gap: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.sm,
        borderRadius: theme.radius.lg,
    },
    rowSelected: {
        backgroundColor: theme.colors.background,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.border,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        fontSize: 15,
        fontWeight: "700",
        color: theme.colors.primary,
    },
    rowContent: {
        flex: 1,
        gap: 6,
        minWidth: 0,
    },
    rowTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: theme.spacing.sm,
    },
    rowTitle: {
        flex: 1,
        fontSize: 15,
        fontWeight: "700",
        color: theme.colors.text,
    },
    rowTime: {
        fontSize: 11,
        color: theme.colors.textMuted,
    },
    rowBottom: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.sm,
    },
    preview: {
        flex: 1,
        fontSize: 13,
        color: theme.colors.textSecondary,
    },
    unreadBadge: {
        minWidth: 22,
        height: 22,
        borderRadius: 11,
        paddingHorizontal: 6,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.primary,
    },
    unreadText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "700",
    },
    emptyWrap: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: theme.spacing.xl,
        gap: theme.spacing.sm,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: theme.colors.text,
    },
    emptyText: {
        fontSize: 13,
        color: theme.colors.textMuted,
        textAlign: "center",
        maxWidth: 220,
    },
});
