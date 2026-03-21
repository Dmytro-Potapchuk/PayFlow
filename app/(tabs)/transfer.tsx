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

import { getToken } from "@/api/authStorage";
import { getErrorMessage } from "@/utils/errorMessage";
import { apiRequest } from "@/api/api";
import AppButton from "@/components/AppButton";
import AppInput from "@/components/AppInput";
import { theme } from "@/constants/theme";
import { keyboardShouldPersistTaps } from "@/constants/keyboard";
import { useAppState } from "@/providers/AppProvider";

export default function TransferScreen() {
    const [receiverLogin, setReceiverLogin] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const { refreshDashboard, refreshMessages, showToast } = useAppState();

    const handleTransfer = async () => {
        if (!receiverLogin || !amount) {
            showToast("Błąd", "Wszystkie pola są wymagane", "error");
            return;
        }

        const transferAmount = Number(amount);
        if (isNaN(transferAmount) || transferAmount <= 0) {
            showToast("Błąd", "Niepoprawna kwota", "error");
            return;
        }

        try {
            setLoading(true);
            const token = await getToken();
            if (!token) {
                showToast("Błąd", "Użytkownik nie jest zalogowany", "error");
                return;
            }

            await apiRequest(
                "/transactions/bank-transfer",
                "POST",
                {
                    receiverAccount: receiverLogin,
                    amount: transferAmount,
                },
                token
            );

            await Promise.all([
                refreshDashboard({ silent: true }),
                refreshMessages({ silent: true, skipToast: true }),
            ]);
            showToast("Sukces", "Przelew zakończony sukcesem", "success");
            setReceiverLogin("");
            setAmount("");
            router.push("/(tabs)/history");
        } catch (error: unknown) {
            const message = getErrorMessage(error, "Nie udało się wykonać przelewu");
            showToast(
                "Błąd",
                message.toLowerCase().includes("insufficient")
                    ? "Niewystarczające środki na koncie – doładuj konto"
                    : message,
                "error"
            );
        } finally {
            setLoading(false);
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
                        />
                        <AppInput
                            label="Kwota (PLN)"
                            placeholder="0.00"
                            keyboardType="decimal-pad"
                            value={amount}
                            onChangeText={setAmount}
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
