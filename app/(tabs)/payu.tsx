import {
    Platform,
    View,
    Text,
    StyleSheet,
    SafeAreaView,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import { useRequireAuthToken } from "@/hooks/useRequireAuthToken";
import { getErrorMessage } from "@/utils/errorMessage";
import { validatePayuAmount } from "@/utils/payuForm";
import { logError } from "@/utils/logError";
import { useIsMounted } from "@/hooks/useIsMounted";
import { getProfile } from "@/api/users.api";
import { createPayment } from "@/api/payu.api";
import AppButton from "@/components/AppButton";
import AppInput from "@/components/AppInput";
import { theme } from "@/constants/theme";
import { useDashboard, useMessages, useToast } from "@/providers/AppProvider";

WebBrowser.maybeCompleteAuthSession();

export default function PayuScreen() {
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const { refreshDashboard } = useDashboard();
    const { refreshMessages } = useMessages();
    const { showToast } = useToast();
    const isMountedRef = useIsMounted();
    const { requireToken } = useRequireAuthToken();

    const handlePay = async () => {
        const validationError = validatePayuAmount(amount);
        if (validationError) {
            showToast("Błąd", validationError, "error");
            return;
        }

        const value = Number(amount);

        try {
            setLoading(true);
            const token = requireToken("Użytkownik nie jest zalogowany");
            if (!token) {
                return;
            }

            const profile = await getProfile(token);
            const returnUrl =
                Platform.OS === "web"
                    ? undefined
                    : Linking.createURL("/payu-result");
            const result = await createPayment(
                value,
                profile.email,
                token,
                returnUrl
            );

            if (!result.redirectUrl) {
                showToast(
                    "Błąd",
                    "Brak adresu przekierowania z PayU. Sprawdź konfigurację backendu.",
                    "error"
                );
                return;
            }

            if (Platform.OS === "web") {
                if (typeof window !== "undefined") {
                    window.location.assign(result.redirectUrl);
                    return;
                }
            } else {
                const authResult = await WebBrowser.openAuthSessionAsync(
                    result.redirectUrl,
                    returnUrl
                );

                if (authResult.type === "cancel" || authResult.type === "dismiss") {
                    showToast("Informacja", "Płatność została anulowana", "info");
                    return;
                }

                if (authResult.type === "success" && authResult.url) {
                    const parsed = Linking.parse(authResult.url);
                    const extOrderId = parsed.queryParams?.extOrderId;

                    if (typeof extOrderId === "string" && extOrderId.trim()) {
                        router.push({
                            pathname: "/payu-result",
                            params: { extOrderId: extOrderId.trim() },
                        });
                        return;
                    }
                }
            }

            await Promise.all([
                refreshDashboard({ silent: true }),
                refreshMessages({ silent: true, skipToast: true }),
            ]);

            if (!isMountedRef.current) {
                return;
            }

            showToast(
                "Informacja",
                result.externalOrderId
                    ? "Płatność została rozpoczęta. Po powrocie status zostanie potwierdzony."
                    : "Status doładowania został odświeżony.",
                "info"
            );
        } catch (error: unknown) {
            logError("payu.createPayment", error);
            showToast(
                "Błąd",
                getErrorMessage(error, "Nie udało się utworzyć płatności PayU"),
                "error"
            );
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
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
                        editable={!loading}
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
        backgroundColor: theme.colors.noticeBackground,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.noticeBorder,
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
        color: theme.colors.noticeText,
    },
});
