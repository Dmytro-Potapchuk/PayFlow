import { useCallback } from "react";
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    ListRenderItem,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { theme } from "@/constants/theme";
import type { ContactSearchResult } from "@/types/message";

type Props = {
    visible: boolean;
    query: string;
    onChangeQuery: (value: string) => void;
    onClose: () => void;
    onSelectContact: (contact: ContactSearchResult) => void;
    contacts: ContactSearchResult[];
    loading: boolean;
};

function ContactListItem({
    contact,
    onSelect,
}: {
    contact: ContactSearchResult;
    onSelect: (contact: ContactSearchResult) => void;
}) {
    return (
        <Pressable
            style={styles.contactRow}
            onPress={() => onSelect(contact)}
        >
            <View style={styles.contactAvatar}>
                <Text style={styles.contactAvatarText}>
                    {contact.login.slice(0, 2).toUpperCase()}
                </Text>
            </View>
            <View style={styles.contactTextWrap}>
                <Text style={styles.contactLogin}>{contact.login}</Text>
                <Text style={styles.contactEmail}>{contact.email}</Text>
            </View>
            <Ionicons
                name="chatbubble-ellipses-outline"
                size={18}
                color={theme.colors.primary}
            />
        </Pressable>
    );
}

export default function NewConversationModal({
    visible,
    query,
    onChangeQuery,
    onClose,
    onSelectContact,
    contacts,
    loading,
}: Props) {
    const renderContact = useCallback<ListRenderItem<ContactSearchResult>>(
        ({ item }) => (
            <ContactListItem contact={item} onSelect={onSelectContact} />
        ),
        [onSelectContact]
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.backdrop} onPress={onClose}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    style={styles.keyboardWrap}
                >
                    <Pressable style={styles.sheet}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Nowa rozmowa</Text>
                            <Pressable onPress={onClose} style={styles.closeButton}>
                                <Ionicons
                                    name="close"
                                    size={20}
                                    color={theme.colors.textMuted}
                                />
                            </Pressable>
                        </View>

                        <Text style={styles.subtitle}>
                            Wybierz użytkownika z listy lub wpisz login / e-mail, aby
                            zawęzić wyniki.
                        </Text>

                        <View style={styles.searchWrap}>
                            <Ionicons
                                name="search-outline"
                                size={18}
                                color={theme.colors.textMuted}
                            />
                            <TextInput
                                placeholder="Szukaj po loginie lub e-mailu"
                                placeholderTextColor={theme.colors.textMuted}
                                value={query}
                                onChangeText={onChangeQuery}
                                style={styles.searchInput}
                                autoCapitalize="none"
                            />
                        </View>

                        {loading ? (
                            <ActivityIndicator
                                size="small"
                                color={theme.colors.primary}
                                style={styles.loader}
                            />
                        ) : contacts.length > 0 ? (
                            <FlatList
                                data={contacts}
                                keyExtractor={(item) => item._id}
                                renderItem={renderContact}
                                keyboardShouldPersistTaps="handled"
                                style={styles.contactList}
                                contentContainerStyle={styles.contactListContent}
                            />
                        ) : (
                            <View style={styles.emptyWrap}>
                                <Text style={styles.emptyTitle}>
                                    {query.trim()
                                        ? "Brak pasujących użytkowników"
                                        : "Brak innych użytkowników"}
                                </Text>
                                <Text style={styles.emptyText}>
                                    {query.trim()
                                        ? "Spróbuj innego loginu lub adresu e-mail."
                                        : "Gdy ktoś się zarejestruje, pojawi się tutaj na liście."}
                                </Text>
                            </View>
                        )}
                    </Pressable>
                </KeyboardAvoidingView>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(12, 20, 44, 0.3)",
        justifyContent: "flex-end",
        alignItems: "center",
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.lg,
    },
    keyboardWrap: {
        width: "100%",
        alignItems: "center",
    },
    sheet: {
        width: "100%",
        maxWidth: 460,
        maxHeight: "70%",
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.xl,
        padding: theme.spacing.lg,
        gap: theme.spacing.md,
        ...theme.shadows.lg,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    title: {
        ...theme.typography.h2,
        color: theme.colors.text,
    },
    subtitle: {
        ...theme.typography.bodySmall,
        color: theme.colors.textMuted,
        lineHeight: 18,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.background,
    },
    searchWrap: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.sm,
        backgroundColor: theme.colors.background,
        borderRadius: theme.radius.full,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    searchInput: {
        flex: 1,
        color: theme.colors.text,
        fontSize: 15,
    },
    loader: {
        marginVertical: theme.spacing.md,
    },
    contactList: {
        flexGrow: 0,
    },
    contactListContent: {
        gap: theme.spacing.sm,
    },
    contactRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.md,
        padding: theme.spacing.sm,
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.background,
    },
    contactAvatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.border,
    },
    contactAvatarText: {
        fontSize: 13,
        fontWeight: "700",
        color: theme.colors.primary,
    },
    contactTextWrap: {
        flex: 1,
        gap: 2,
    },
    contactLogin: {
        fontSize: 15,
        fontWeight: "700",
        color: theme.colors.text,
    },
    contactEmail: {
        fontSize: 12,
        color: theme.colors.textMuted,
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
    },
});
