import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";

import { createTransfer } from "@/api/transactions.api";
import { useRequireAuthToken } from "@/hooks/useRequireAuthToken";
import { AUTH_FIELD_LIMITS } from "@/constants/authLimits";
import { useIsMounted } from "@/hooks/useIsMounted";
import AppButton from "@/components/AppButton";
import AppInput from "@/components/AppInput";
import { theme } from "@/constants/theme";
import { keyboardShouldPersistTaps } from "@/constants/keyboard";
import { useDashboard, useMessages, useToast } from "@/providers/AppProvider";
import {
    getErrorMessage,
    isInsufficientFundsError,
} from "@/utils/errorMessage";
import { logError } from "@/utils/logError";

export default function TransferScreen() {
    const [receiverLogin, setReceiverLogin] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const isMountedRef = useIsMounted();
    const { requireToken } = useRequireAuthToken();
    const { refreshDashboard } = useDashboard();
    const { refreshMessages } = useMessages();
    const { showToast } = useToast();

    const handleTransfer = async () => {
        const trimmedReceiver = receiverLogin.trim();

        if (!trimmedReceiver || !amount.trim()) {
            showToast("Błąd", "Wszystkie pola są wymagane", "error");
            return;
        }

        if (trimmedReceiver.length > AUTH_FIELD_LIMITS.login.max) {
            showToast(
                "Błąd",
                `Login odbiorcy może mieć maksymalnie ${AUTH_FIELD_LIMITS.login.max} znaków`,
                "error"
            );
            return;
        }

        const transferAmount = Number(amount);
        if (isNaN(transferAmount) || transferAmount <= 0) {
            showToast("Błąd", "Niepoprawna kwota", "error");
            return;
        }

        try {
            setLoading(true);
            const token = requireToken("Użytkownik nie jest zalogowany");
            if (!token) {
                return;
            }

            await createTransfer(trimmedReceiver, transferAmount, token);

            await Promise.all([
                refreshDashboard({ silent: true }),
                refreshMessages({ silent: true, skipToast: true }),
            ]);

            if (!isMountedRef.current) {
                return;
            }

            showToast("Sukces", "Przelew zakończony sukcesem", "success");
            setReceiverLogin("");
            setAmount("");
            router.push("/(tabs)/history");
        } catch (error: unknown) {
            logError("transfer.create", error);

            if (!isMountedRef.current) {
                return;
            }

            const message = isInsufficientFundsError(error)
                ? "Niewystarczające środki na koncie – doładuj konto"
                : getErrorMessage(error, "Nie udało się wykonać przelewu");

            showToast("Błąd", message, "error");
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps={keyboardShouldPersistTaps}
                    keyboardDismissMode="on-drag"
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Nowy przelew</Text>
                        <Text style={styles.subtitle}>
                            Przelej środki na konto odbiorcy
                        </Text>
                    </View>

                    <View style={styles.card}>
                        <AppInput
                            label="Login odbiorcy"
                            placeholder="Wpisz login odbiorcy"
                            value={receiverLogin}
                            onChangeText={setReceiverLogin}
                            autoCapitalize="none"
                            autoCorrect={false}
                            maxLength={AUTH_FIELD_LIMITS.login.max}
                            editable={!loading}
                        />
                        <AppInput
                            label="Kwota (PLN)"
                            placeholder="0.00"
                            keyboardType="decimal-pad"
                            value={amount}
                            onChangeText={setAmount}
                            editable={!loading}
                        />
                        <AppButton
                            title={loading ? "Wysyłanie..." : "Wyślij przelew"}
                            onPress={handleTransfer}
                            loading={loading}
                            disabled={loading}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    flex: { flex: 1 },
    scroll: {
        flexGrow: 1,
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
        ...theme.shadows.md,
    },
});
