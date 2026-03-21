import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
} from "react-native";
import { useState } from "react";
import * as WebBrowser from "expo-web-browser";

import { getToken } from "@/api/authStorage";
import { getErrorMessage } from "@/utils/errorMessage";
import { getProfile } from "@/api/users.api";
import { createPayment } from "@/api/payu.api";
import AppButton from "@/components/AppButton";
import AppInput from "@/components/AppInput";
import { theme } from "@/constants/theme";
import { useAppState } from "@/providers/AppProvider";

export default function PayuScreen() {
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const { refreshDashboard, refreshMessages, showToast } = useAppState();

    const handlePay = async () => {
        if (!amount) {
            showToast("Błąd", "Podaj kwotę doładowania", "error");
            return;
        }

        const value = Number(amount);
        if (isNaN(value) || value <= 0) {
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

            const profile = await getProfile(token);
            const email = profile.email;
            const result = await createPayment(value, email, token);

            if (result?.redirectUrl) {
                await WebBrowser.openBrowserAsync(result.redirectUrl);
                await Promise.all([
                    refreshDashboard({ silent: true }),
                    refreshMessages({ silent: true, skipToast: true }),
                ]);
                showToast(
                    "Informacja",
                    "Status doładowania został odświeżony.",
                    "info"
                );
            } else {
                showToast(
                    "Błąd",
                    "Brak adresu przekierowania z PayU. Sprawdź konfigurację backendu."
                    ,
                    "error"
                );
            }
        } catch (error: unknown) {
            showToast(
                "Błąd",
                getErrorMessage(error, "Nie udało się utworzyć płatności PayU"),
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Doładowanie konta</Text>
                    <Text style={styles.subtitle}>
                        PayU sandbox – bezpieczna płatność
                    </Text>
                </View>

                <View style={styles.card}>
                    <AppInput
                        label="Kwota doładowania (PLN)"
                        placeholder="np. 100"
                        keyboardType="decimal-pad"
                        value={amount}
                        onChangeText={setAmount}
                    />
                    <AppButton
                        title={loading ? "Przekierowanie..." : "Zapłać przez PayU"}
                        onPress={handlePay}
                        loading={loading}
                        disabled={loading}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    container: {
        flex: 1,
        padding: theme.spacing.lg,
        justifyContent: "center",
    },
    header: { marginBottom: theme.spacing.xl },
    title: {
        ...theme.typography.h1,
        color: theme.colors.text,
        textAlign: "center",
    },
    subtitle: {
        ...theme.typography.bodySmall,
        color: theme.colors.textMuted,
        marginTop: 4,
        textAlign: "center",
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        ...theme.shadows.md,
    },
});
