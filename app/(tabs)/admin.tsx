import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    ActivityIndicator,
    SafeAreaView,
    useWindowDimensions,
    TouchableOpacity,
} from "react-native";
import { useCallback, useEffect, useState } from "react";

import { getUsers, updateBalance, updateRole } from "@/api/users.api";
import AppButton from "@/components/AppButton";
import { isCompactWidth } from "@/constants/layout";
import { theme } from "@/constants/theme";
import { keyboardShouldPersistTaps } from "@/constants/keyboard";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { useRequireAuthToken } from "@/hooks/useRequireAuthToken";
import { useIsMounted } from "@/hooks/useIsMounted";
import { useToast } from "@/providers/AppProvider";
import type { AdminUserSummary, UserRole } from "@/types/api.types";
import { getErrorMessage } from "@/utils/errorMessage";
import { logError } from "@/utils/logError";

const USER_ROLES: UserRole[] = ["user", "admin"];

export default function AdminScreen() {
    const { isAllowed, isChecking } = useRequireAdmin();
    const { requireToken } = useRequireAuthToken();
    const [users, setUsers] = useState<AdminUserSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [balanceInputs, setBalanceInputs] = useState<Record<string, string>>({});
    const [roleInputs, setRoleInputs] = useState<Record<string, UserRole>>({});
    const { showToast } = useToast();
    const { width } = useWindowDimensions();
    const isCompact = isCompactWidth(width);
    const isMountedRef = useIsMounted();

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            const token = requireToken();
            if (!token) {
                return;
            }

            const data = await getUsers(token);

            if (!isMountedRef.current) {
                return;
            }

            setUsers(data);

            const initialBalances: Record<string, string> = {};
            const initialRoles: Record<string, UserRole> = {};
            data.forEach((user) => {
                initialBalances[user._id] = String(user.balance ?? 0);
                initialRoles[user._id] =
                    user.role === "admin" ? "admin" : "user";
            });
            setBalanceInputs(initialBalances);
            setRoleInputs(initialRoles);
        } catch (error: unknown) {
            logError("admin.loadUsers", error);
            showToast(
                "Błąd",
                getErrorMessage(error, "Nie udało się pobrać użytkowników."),
                "error"
            );
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, [isMountedRef, requireToken, showToast]);

    useEffect(() => {
        if (isAllowed) {
            loadUsers();
        }
    }, [isAllowed, loadUsers]);

    const handleSaveBalance = async (userId: string) => {
        const balanceText = balanceInputs[userId] ?? "";
        const newBalance = Number(balanceText);

        if (!Number.isFinite(newBalance)) {
            showToast("Błąd", "Saldo musi być liczbą.", "error");
            return;
        }

        if (newBalance < 0) {
            showToast("Błąd", "Saldo nie może być ujemne.", "error");
            return;
        }

        try {
            setSavingId(userId);
            const token = requireToken();
            if (!token) {
                return;
            }

            await updateBalance(userId, newBalance, token);

            if (!isMountedRef.current) {
                return;
            }

            setUsers((prev) =>
                prev.map((user) =>
                    user._id === userId ? { ...user, balance: newBalance } : user
                )
            );
            showToast("Sukces", "Saldo zaktualizowane.", "success");
        } catch (error: unknown) {
            logError("admin.updateBalance", error);
            showToast(
                "Błąd",
                getErrorMessage(error, "Nie udało się zaktualizować salda."),
                "error"
            );
        } finally {
            if (isMountedRef.current) {
                setSavingId(null);
            }
        }
    };

    const handleSaveRole = async (userId: string) => {
        const role = roleInputs[userId];

        if (!role) {
            showToast("Błąd", "Wybierz rolę użytkownika.", "error");
            return;
        }

        try {
            setSavingId(userId);
            const token = requireToken();
            if (!token) {
                return;
            }

            await updateRole(userId, role, token);

            if (!isMountedRef.current) {
                return;
            }

            setUsers((prev) =>
                prev.map((user) => (user._id === userId ? { ...user, role } : user))
            );
            showToast("Sukces", "Rola zaktualizowana.", "success");
        } catch (error: unknown) {
            logError("admin.updateRole", error);
            showToast(
                "Błąd",
                getErrorMessage(error, "Nie udało się zaktualizować roli."),
                "error"
            );
        } finally {
            if (isMountedRef.current) {
                setSavingId(null);
            }
        }
    };

    const renderItem = ({ item }: { item: AdminUserSummary }) => {
        const balanceText = balanceInputs[item._id] ?? String(item.balance ?? 0);
        const selectedRole = roleInputs[item._id] ?? item.role;
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
                    <View style={styles.rolePicker}>
                        {USER_ROLES.map((role) => {
                            const isSelected = selectedRole === role;
                            return (
                                <TouchableOpacity
                                    key={role}
                                    style={[
                                        styles.roleOption,
                                        isSelected && styles.roleOptionSelected,
                                    ]}
                                    onPress={() =>
                                        setRoleInputs((prev) => ({
                                            ...prev,
                                            [item._id]: role,
                                        }))
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.roleOptionText,
                                            isSelected && styles.roleOptionTextSelected,
                                        ]}
                                    >
                                        {role}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
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

    if (isChecking) {
        return (
            <SafeAreaView style={styles.safe}>
                <ActivityIndicator
                    size="large"
                    color={theme.colors.primary}
                    style={styles.loader}
                />
            </SafeAreaView>
        );
    }

    if (!isAllowed) {
        return null;
    }

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
    rolePicker: {
        flex: 1,
        flexDirection: "row",
        gap: theme.spacing.sm,
    },
    roleOption: {
        flex: 1,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.sm,
        paddingVertical: 10,
        alignItems: "center",
    },
    roleOptionSelected: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.border,
    },
    roleOptionText: {
        fontSize: 14,
        color: theme.colors.textMuted,
        textTransform: "capitalize",
    },
    roleOptionTextSelected: {
        color: theme.colors.primary,
        fontWeight: "600",
    },
    smallBtn: {
        paddingHorizontal: 16,
        minHeight: 40,
    },
    smallBtnCompact: {
        width: "100%",
    },
});
