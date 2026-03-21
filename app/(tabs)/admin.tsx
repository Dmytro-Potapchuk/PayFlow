import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    ActivityIndicator,
    SafeAreaView,
    useWindowDimensions,
} from "react-native";
import { useEffect, useState } from "react";

import { getToken } from "@/api/authStorage";
import { getUsers, updateBalance, updateRole } from "@/api/users.api";
import AppButton from "@/components/AppButton";
import { theme } from "@/constants/theme";
import { keyboardShouldPersistTaps } from "@/constants/keyboard";
import { useAppState } from "@/providers/AppProvider";

interface User {
    _id: string;
    login: string;
    email: string;
    balance: number;
    role: string;
}

export default function AdminScreen() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [balanceInputs, setBalanceInputs] = useState<Record<string, string>>({});
    const [roleInputs, setRoleInputs] = useState<Record<string, string>>({});
    const { showToast } = useAppState();
    const { width } = useWindowDimensions();
    const isCompact = width <= 430;

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            if (!token) {
                showToast("Błąd", "Brak tokenu – zaloguj się ponownie.", "error");
                return;
            }

            const data: User[] = await getUsers(token);
            setUsers(data);

            const initialBalances: Record<string, string> = {};
            const initialRoles: Record<string, string> = {};
            data.forEach((u) => {
                initialBalances[u._id] = String(u.balance);
                initialRoles[u._id] = u.role;
            });
            setBalanceInputs(initialBalances);
            setRoleInputs(initialRoles);
        } catch {
            showToast("Błąd", "Nie udało się pobrać użytkowników.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBalance = async (userId: string) => {
        const balanceText = balanceInputs[userId] ?? "";
        const newBalance = Number(balanceText);

        if (isNaN(newBalance)) {
            showToast("Błąd", "Saldo musi być liczbą.", "error");
            return;
        }

        try {
            setSavingId(userId);
            const token = await getToken();
            if (!token) {
                showToast("Błąd", "Brak tokenu – zaloguj się ponownie.", "error");
                return;
            }

            await updateBalance(userId, newBalance, token);
            setUsers((prev) =>
                prev.map((u) =>
                    u._id === userId ? { ...u, balance: newBalance } : u
                )
            );
            showToast("Sukces", "Saldo zaktualizowane.", "success");
        } catch {
            showToast("Błąd", "Nie udało się zaktualizować salda.", "error");
        } finally {
            setSavingId(null);
        }
    };

    const handleSaveRole = async (userId: string) => {
        const role = roleInputs[userId] ?? "";
        if (!role) {
            showToast("Błąd", "Rola nie może być pusta.", "error");
            return;
        }

        try {
            setSavingId(userId);
            const token = await getToken();
            if (!token) {
                showToast("Błąd", "Brak tokenu – zaloguj się ponownie.", "error");
                return;
            }

            await updateRole(userId, role, token);
            setUsers((prev) =>
                prev.map((u) =>
                    u._id === userId ? { ...u, role } : u
                )
            );
            showToast("Sukces", "Rola zaktualizowana.", "success");
        } catch {
            showToast("Błąd", "Nie udało się zaktualizować roli.", "error");
        } finally {
            setSavingId(null);
        }
    };

    const renderItem = ({ item }: { item: User }) => {
        const balanceText = balanceInputs[item._id] ?? String(item.balance);
        const roleText = roleInputs[item._id] ?? item.role;
        const isSaving = savingId === item._id;

        return (
            <View style={styles.userCard}>
                <Text style={styles.userTitle}>{item.login}</Text>
                <Text style={styles.userSubtitle}>{item.email}</Text>

                <View style={[styles.row, isCompact && styles.rowCompact]}>
                    <Text style={[styles.label, isCompact && styles.labelCompact]}>Saldo</Text>
                    <TextInput
                        style={styles.input}
                        value={balanceText}
                        keyboardType="numeric"
                        onChangeText={(text) =>
                            setBalanceInputs((prev) => ({
                                ...prev,
                                [item._id]: text,
                            }))
                        }
                        placeholderTextColor={theme.colors.textMuted}
                    />
                    <AppButton
                        title="Zapisz"
                        onPress={() => handleSaveBalance(item._id)}
                        disabled={isSaving}
                        loading={isSaving}
                        style={[styles.smallBtn, isCompact && styles.smallBtnCompact]}
                    />
                </View>

                <View style={[styles.row, isCompact && styles.rowCompact]}>
                    <Text style={[styles.label, isCompact && styles.labelCompact]}>Rola</Text>
                    <TextInput
                        style={styles.input}
                        value={roleText}
                        onChangeText={(text) =>
                            setRoleInputs((prev) => ({
                                ...prev,
                                [item._id]: text,
                            }))
                        }
                        placeholder="user / admin"
                        placeholderTextColor={theme.colors.textMuted}
                    />
                    <AppButton
                        title="Zapisz"
                        onPress={() => handleSaveRole(item._id)}
                        disabled={isSaving}
                        loading={isSaving}
                        style={[styles.smallBtn, isCompact && styles.smallBtnCompact]}
                    />
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Panel administratora</Text>
                    <Text style={styles.subtitle}>Zarządzanie użytkownikami</Text>
                </View>

                {loading ? (
                    <ActivityIndicator
                        size="large"
                        color={theme.colors.primary}
                        style={styles.loader}
                    />
                ) : (
                    <FlatList
                        data={users}
                        keyExtractor={(item) => item._id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
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
    listContent: { paddingBottom: 24 },
    loader: { marginTop: theme.spacing.xl },
    userCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        ...theme.shadows.md,
    },
    userTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: theme.colors.text,
    },
    userSubtitle: {
        fontSize: 14,
        color: theme.colors.textMuted,
        marginBottom: theme.spacing.md,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: theme.spacing.sm,
        gap: theme.spacing.sm,
    },
    rowCompact: {
        flexDirection: "column",
        alignItems: "stretch",
    },
    label: {
        width: 50,
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    labelCompact: {
        width: "auto",
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.sm,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: theme.colors.text,
    },
    smallBtn: {
        paddingHorizontal: 16,
        minHeight: 40,
    },
    smallBtnCompact: {
        width: "100%",
    },
});
