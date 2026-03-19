import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    ActivityIndicator,
    Alert,
    SafeAreaView,
} from "react-native";
import { useEffect, useState } from "react";

import { getToken } from "@/api/authStorage";
import { getUsers, updateBalance, updateRole } from "@/api/users.api";
import AppButton from "@/components/AppButton";
import { theme } from "@/constants/theme";
import { keyboardShouldPersistTaps } from "@/constants/keyboard";

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

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            if (!token) {
                Alert.alert("Błąd", "Brak tokenu – zaloguj się ponownie.");
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
            Alert.alert("Błąd", "Nie udało się pobrać użytkowników.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBalance = async (userId: string) => {
        const balanceText = balanceInputs[userId] ?? "";
        const newBalance = Number(balanceText);

        if (isNaN(newBalance)) {
            Alert.alert("Błąd", "Saldo musi być liczbą.");
            return;
        }

        try {
            setSavingId(userId);
            const token = await getToken();
            if (!token) {
                Alert.alert("Błąd", "Brak tokenu – zaloguj się ponownie.");
                return;
            }

            await updateBalance(userId, newBalance, token);
            setUsers((prev) =>
                prev.map((u) =>
                    u._id === userId ? { ...u, balance: newBalance } : u
                )
            );
            Alert.alert("Sukces", "Saldo zaktualizowane.");
        } catch {
            Alert.alert("Błąd", "Nie udało się zaktualizować salda.");
        } finally {
            setSavingId(null);
        }
    };

    const handleSaveRole = async (userId: string) => {
        const role = roleInputs[userId] ?? "";
        if (!role) {
            Alert.alert("Błąd", "Rola nie może być pusta.");
            return;
        }

        try {
            setSavingId(userId);
            const token = await getToken();
            if (!token) {
                Alert.alert("Błąd", "Brak tokenu – zaloguj się ponownie.");
                return;
            }

            await updateRole(userId, role, token);
            setUsers((prev) =>
                prev.map((u) =>
                    u._id === userId ? { ...u, role } : u
                )
            );
            Alert.alert("Sukces", "Rola zaktualizowana.");
        } catch {
            Alert.alert("Błąd", "Nie udało się zaktualizować roli.");
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

                <View style={styles.row}>
                    <Text style={styles.label}>Saldo</Text>
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
                        style={styles.smallBtn}
                    />
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Rola</Text>
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
                        style={styles.smallBtn}
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
    label: {
        width: 50,
        fontSize: 14,
        color: theme.colors.textSecondary,
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
});
