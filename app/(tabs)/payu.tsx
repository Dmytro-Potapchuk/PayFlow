import {
    Platform,
    View,
    Text,
    StyleSheet,
    SafeAreaView,
} from "react-native";
import { useState } from "react";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import { getToken } from "@/api/authStorage";
import { getErrorMessage } from "@/utils/errorMessage";
import { getProfile } from "@/api/users.api";
import { createPayment } from "@/api/payu.api";
import AppButton from "@/components/AppButton";
import AppInput from "@/components/AppInput";
import { theme } from "@/constants/theme";
import { useAppState } from "@/providers/AppProvider";

WebBrowser.maybeCompleteAuthSession();

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
            const returnUrl =
                Platform.OS === "web"
                    ? undefined
                    : Linking.createURL("/payu-result");
            const result = (await createPayment(
                value,
                email,
                token,
                returnUrl
            )) as { redirectUrl?: string; externalOrderId?: string };

            if (result?.redirectUrl) {
                if (Platform.OS === "web") {
                    if (typeof window !== "undefined") {
                        window.location.assign(result.redirectUrl);
                        return;
                    }
                } else {
                    await WebBrowser.openAuthSessionAsync(
                        result.redirectUrl,
                        returnUrl
                    );
                }
                await Promise.all([
                    refreshDashboard({ silent: true }),
                    refreshMessages({ silent: true, skipToast: true }),
                ]);
                showToast(
                    "Informacja",
                    result.externalOrderId
                        ? "Płatność została rozpoczęta. Po powrocie status zostanie potwierdzony."
                        : "Status doładowania został odświeżony.",
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
                        PayU sandbox - płatność testowa
                    </Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.notice}>
                        <Text style={styles.noticeTitle}>Płatności testowe</Text>
                        <Text style={styles.noticeText}>
                            Ten ekran korzysta z PayU sandbox. Nie wykonuje prawdziwych
                            transakcji i nie obsługuje realnych środków.
                        </Text>
                    </View>
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
    notice: {
        backgroundColor: "#fff8e1",
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: "#ffe082",
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
    },
    noticeTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: theme.colors.warning,
        marginBottom: 4,
    },
    noticeText: {
        fontSize: 13,
        lineHeight: 18,
        color: "#6d4c41",
    },
});
