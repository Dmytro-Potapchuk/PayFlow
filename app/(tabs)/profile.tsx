import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
} from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { updateOwnProfile } from "@/api/users.api";
import AppButton from "@/components/AppButton";
import AppInput from "@/components/AppInput";
import { theme } from "@/constants/theme";
import { useRequireAuthToken } from "@/hooks/useRequireAuthToken";
import { useProfile, useSession, useToast } from "@/providers/AppProvider";
import { getErrorMessage } from "@/utils/errorMessage";
import { logError } from "@/utils/logError";
import { getPasswordValidationError } from "@/utils/passwordValidation";

export default function ProfileScreen() {
    const { clearSession } = useSession();
    const { profile, refreshProfile } = useProfile();
    const { showToast } = useToast();
    const { requireToken } = useRequireAuthToken();
    const [phone, setPhone] = useState(profile?.phone ?? "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [saving, setSaving] = useState(false);

    useFocusEffect(
        useCallback(() => {
            refreshProfile({ silent: true })
                .then((nextProfile) => {
                    setPhone(nextProfile?.phone ?? "");
                })
                .catch((error: unknown) => {
                    logError("profile.refresh", error);
                });
        }, [refreshProfile])
    );

    const saveProfile = async () => {
        if (newPassword) {
            const passwordError = getPasswordValidationError(newPassword);
            if (passwordError) {
                showToast("Błąd", passwordError, "error");
                return;
            }
            if (!currentPassword) {
                showToast("Błąd", "Podaj obecne hasło", "error");
                return;
            }
        }

        try {
            setSaving(true);
            const token = requireToken("Zaloguj się, aby zapisać profil");
            if (!token) {
                return;
            }

            await updateOwnProfile(token, {
                phone: phone.trim(),
                ...(newPassword
                    ? { currentPassword, newPassword }
                    : {}),
            });
            await refreshProfile({ silent: true });
            setCurrentPassword("");
            setNewPassword("");
            showToast("Sukces", "Zapisano zmiany profilu", "success");
        } catch (error: unknown) {
            logError("profile.save", error);
            showToast(
                "Błąd",
                getErrorMessage(error, "Nie udało się zapisać profilu"),
                "error"
            );
        } finally {
            setSaving(false);
        }
    };

    const logout = async () => {
        try {
            await clearSession();
            showToast("Informacja", "Zostałeś wylogowany", "info");
            router.replace("/auth/login");
        } catch (error: unknown) {
            logError("profile.logout", error);
            showToast(
                "Błąd",
                getErrorMessage(error, "Nie udało się wylogować"),
                "error"
            );
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Profil użytkownika</Text>
                    <Text style={styles.subtitle}>Twoje dane konta</Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.avatarWrap}>
                        <Ionicons
                            name="person"
                            size={48}
                            color={theme.colors.primary}
                        />
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Login</Text>
                        <Text style={styles.value}>{profile?.login ?? "-"}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Email</Text>
                        <Text style={styles.value}>{profile?.email ?? "-"}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Rola</Text>
                        <Text style={styles.value}>
                            {profile?.role === "admin" ? "Administrator" : "Użytkownik"}
                        </Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Dane i hasło</Text>
                    <AppInput
                        label="Telefon"
                        placeholder="Opcjonalnie"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        editable={!saving}
                    />
                    <AppInput
                        label="Obecne hasło"
                        placeholder="Wymagane przy zmianie hasła"
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        isPassword
                        editable={!saving}
                    />
                    <AppInput
                        label="Nowe hasło"
                        placeholder="Litera i cyfra, min. 6 znaków"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        isPassword
                        editable={!saving}
                    />
                    <AppButton
                        title={saving ? "Zapisywanie..." : "Zapisz zmiany"}
                        onPress={saveProfile}
                        loading={saving}
                        disabled={saving}
                    />
                </View>

                <AppButton
                    title="Wyloguj się"
                    onPress={logout}
                    variant="danger"
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    container: {
        padding: theme.spacing.lg,
        paddingBottom: 40,
    },
    sectionTitle: {
        ...theme.typography.h3,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
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
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
        ...theme.shadows.md,
    },
    avatarWrap: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.border,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        marginBottom: theme.spacing.lg,
    },
    infoRow: {
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    label: {
        fontSize: 12,
        color: theme.colors.textMuted,
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
        fontWeight: "500",
        color: theme.colors.text,
    },
});
