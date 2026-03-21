import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AppButton from "@/components/AppButton";
import { theme } from "@/constants/theme";
import { useAppState } from "@/providers/AppProvider";

export default function ProfileScreen() {
    const { clearSession, profile, refreshProfile, showToast } = useAppState();

    useFocusEffect(
        useCallback(() => {
            refreshProfile({ silent: true });
        }, [refreshProfile])
    );

    const logout = async () => {
        await clearSession();
        showToast("Informacja", "Zostałeś wylogowany", "info");
        router.replace("/auth/login");
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
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

                <AppButton
                    title="Wyloguj się"
                    onPress={logout}
                    variant="danger"
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    container: {
        flex: 1,
        padding: theme.spacing.lg,
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
