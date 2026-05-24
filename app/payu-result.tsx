import { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { confirmPayment } from "@/api/payu.api";
import { useRequireAuthToken } from "@/hooks/useRequireAuthToken";
import AppButton from "@/components/AppButton";
import { theme } from "@/constants/theme";
import { useDashboard, useMessages, useToast } from "@/providers/AppProvider";
import { getErrorMessage } from "@/utils/errorMessage";
import { logError } from "@/utils/logError";

export default function PayuResultScreen() {
    const { extOrderId } = useLocalSearchParams<{ extOrderId?: string }>();
    const { refreshDashboard } = useDashboard();
    const { refreshMessages } = useMessages();
    const { showToast } = useToast();
    const { token } = useRequireAuthToken();
    const [statusText, setStatusText] = useState(
        "Sprawdzamy status płatności i odświeżamy saldo."
    );

    useEffect(() => {
        let isActive = true;

        const setStatusIfActive = (message: string) => {
            if (isActive) {
                setStatusText(message);
            }
        };

        const run = async () => {
            if (!isActive) {
                return;
            }

            if (token && extOrderId) {
                try {
                    const result = await confirmPayment(extOrderId, token);

                    if (!isActive) {
                        return;
                    }

                    if (result.balanceApplied) {
                        setStatusIfActive(
                            "Płatność została potwierdzona. Saldo i historia zostały odświeżone."
                        );
                        showToast(
                            "Sukces",
                            "Doładowanie zostało zaksięgowane.",
                            "success"
                        );
                    } else if (result.status === "PENDING") {
                        setStatusIfActive(
                            "Płatność jest jeszcze przetwarzana przez PayU. Odśwież dane za chwilę."
                        );
                    } else if (result.status === "CANCELED") {
                        setStatusIfActive("Płatność została anulowana.");
                    } else {
                        setStatusIfActive(
                            "Nie udało się jeszcze potwierdzić płatności. Spróbuj odświeżyć dane za chwilę."
                        );
                    }
                } catch (error: unknown) {
                    logError("payu-result.confirmPayment", error);
                    setStatusIfActive(
                        getErrorMessage(
                            error,
                            "Wystąpił problem przy potwierdzaniu płatności. Spróbuj ponownie za chwilę."
                        )
                    );
                }
            }

            try {
                await Promise.all([
                    refreshDashboard({ silent: true }),
                    refreshMessages({ silent: true, skipToast: true }),
                ]);
            } catch (error: unknown) {
                logError("payu-result.refresh", error);
            }
        };

        run().catch((error: unknown) => {
            logError("payu-result.run", error);
        });

        return () => {
            isActive = false;
        };
    }, [extOrderId, refreshDashboard, refreshMessages, showToast, token]);

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <View style={styles.card}>
                    <Text style={styles.title}>Powrót z PayU</Text>
                    <Text style={styles.subtitle}>{statusText}</Text>
                    <AppButton
                        title="Przejdź do dashboardu"
                        onPress={() => router.replace("/(tabs)")}
                        style={styles.primaryBtn}
                    />
                    <AppButton
                        title="Wróć do doładowania"
                        onPress={() => router.replace("/(tabs)/payu")}
                        variant="outline"
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
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        ...theme.shadows.md,
    },
    title: {
        ...theme.typography.h2,
        color: theme.colors.text,
        textAlign: "center",
        marginBottom: theme.spacing.sm,
    },
    subtitle: {
        ...theme.typography.bodySmall,
        color: theme.colors.textMuted,
        textAlign: "center",
        lineHeight: 20,
        marginBottom: theme.spacing.lg,
    },
    primaryBtn: {
        marginBottom: theme.spacing.md,
    },
});
