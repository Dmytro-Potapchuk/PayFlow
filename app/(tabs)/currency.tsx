import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    SafeAreaView,
} from "react-native";
import { useCallback, useEffect, useState } from "react";

import { getRates, buyCurrency } from "@/api/currency.api";
import type { CurrencyCode } from "@/types/api.types";
import { useRequireAuthToken } from "@/hooks/useRequireAuthToken";
import { getErrorMessage } from "@/utils/errorMessage";
import {
    buildConversionResult,
    canBuyCurrency,
    validatePlnAmount,
} from "@/utils/currencyForm";
import type { NbpRate } from "@/utils/nbpRates";
import { logError } from "@/utils/logError";
import { useIsMounted } from "@/hooks/useIsMounted";
import AppInput from "@/components/AppInput";
import AppButton from "@/components/AppButton";
import { theme } from "@/constants/theme";
import { keyboardShouldPersistTaps } from "@/constants/keyboard";
import { useDashboard, useMessages, useToast } from "@/providers/AppProvider";

export default function CurrencyScreen() {
    const [rates, setRates] = useState<NbpRate[]>([]);
    const [loading, setLoading] = useState(false);
    const [amountPln, setAmountPln] = useState("");
    const [selected, setSelected] = useState<NbpRate | null>(null);
    const [result, setResult] = useState<string | null>(null);
    const [buying, setBuying] = useState(false);
    const { refreshDashboard } = useDashboard();
    const { refreshMessages } = useMessages();
    const { showToast } = useToast();
    const isMountedRef = useIsMounted();
    const { requireToken } = useRequireAuthToken();

    const loadRates = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getRates();

            if (!isMountedRef.current) {
                return;
            }

            setRates(data);

            if (data.length === 0) {
                showToast("Błąd", "Brak dostępnych kursów walut", "error");
            }
        } catch (error: unknown) {
            logError("currency.loadRates", error);
            showToast(
                "Błąd",
                getErrorMessage(error, "Nie udało się pobrać kursów walut"),
                "error"
            );
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, [isMountedRef, showToast]);

    useEffect(() => {
        loadRates();
    }, [loadRates]);

    const handleConvert = () => {
        const validationError = validatePlnAmount(amountPln);
        if (validationError) {
            showToast("Błąd", validationError, "error");
            return;
        }

        if (!selected) {
            showToast("Błąd", "Wybierz walutę", "error");
            return;
        }

        const amount = Number(amountPln);
        setResult(buildConversionResult(amount, selected));
    };

    const handleBuy = async () => {
        if (!canBuyCurrency(selected)) {
            showToast("Błąd", "Kupno możliwe tylko dla EUR lub USD", "error");
            return;
        }

        const validationError = validatePlnAmount(amountPln);
        if (validationError) {
            showToast("Błąd", validationError, "error");
            return;
        }

        const amount = Number(amountPln);
        const currencyCode = selected.code as CurrencyCode;

        try {
            setBuying(true);
            const token = requireToken("Zaloguj się, aby kupić walutę");
            if (!token) {
                return;
            }

            const response = await buyCurrency(amount, currencyCode, token);
            await Promise.all([
                refreshDashboard({ silent: true }),
                refreshMessages({ silent: true, skipToast: true }),
            ]);

            if (!isMountedRef.current) {
                return;
            }

            showToast(
                "Sukces",
                `Kupiono ${response.boughtAmount.toFixed(2)} ${response.currencyCode}.`,
                "success"
            );
            setAmountPln("");
            setResult(null);
        } catch (error: unknown) {
            logError("currency.buy", error);
            showToast(
                "Błąd",
                getErrorMessage(error, "Nie udało się kupić waluty"),
                "error"
            );
        } finally {
            if (isMountedRef.current) {
                setBuying(false);
            }
        }
    };

    const renderItem = useCallback(
        ({ item }: { item: NbpRate }) => {
            const isSelected = selected?.code === item.code;
            return (
                <TouchableOpacity
                    style={[styles.rateRow, isSelected && styles.rateRowSelected]}
                    onPress={() => setSelected(item)}
                    activeOpacity={0.7}
                >
                    <View>
                        <Text style={styles.rateCode}>{item.code}</Text>
                        <Text style={styles.rateName}>{item.currency}</Text>
                    </View>
                    <Text style={styles.rateValue}>{item.mid.toFixed(4)} PLN</Text>
                </TouchableOpacity>
            );
        },
        [selected?.code]
    );

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Kursy walut</Text>
                    <Text style={styles.subtitle}>NBP (tabela A)</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Przelicznik PLN → waluta</Text>
                    <AppInput
                        placeholder="Kwota w PLN"
                        keyboardType="decimal-pad"
                        value={amountPln}
                        onChangeText={setAmountPln}
                        editable={!buying}
                    />
                    {result && (
                        <View style={styles.resultBox}>
                            <Text style={styles.resultText}>{result}</Text>
                        </View>
                    )}
                    <View style={styles.buttonRow}>
                        <AppButton
                            title="Przelicz"
                            onPress={handleConvert}
                            variant="outline"
                            style={styles.btn}
                            disabled={buying}
                        />
                        {canBuyCurrency(selected) && (
                            <AppButton
                                title={buying ? "Kupowanie..." : "Kup walutę"}
                                onPress={handleBuy}
                                disabled={buying}
                                loading={buying}
                                style={styles.btn}
                            />
                        )}
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Dostępne waluty</Text>

                {loading ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                ) : (
                    <FlatList
                        data={rates}
                        keyExtractor={(item) => item.code}
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
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
        ...theme.shadows.md,
    },
    sectionTitle: {
        ...theme.typography.h3,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    resultBox: {
        backgroundColor: theme.colors.border,
        padding: theme.spacing.md,
        borderRadius: theme.radius.sm,
        marginBottom: theme.spacing.md,
    },
    resultText: {
        fontSize: 16,
        color: theme.colors.text,
        fontWeight: "500",
    },
    buttonRow: {
        flexDirection: "row",
        gap: theme.spacing.md,
    },
    btn: { flex: 1 },
    rateRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        marginBottom: theme.spacing.xs,
        borderRadius: theme.radius.md,
        ...theme.shadows.sm,
    },
    rateRowSelected: {
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    rateCode: {
        fontSize: 16,
        fontWeight: "600",
        color: theme.colors.text,
    },
    rateName: {
        fontSize: 12,
        color: theme.colors.textMuted,
        marginTop: 2,
    },
    rateValue: {
        fontSize: 14,
        fontWeight: "600",
        color: theme.colors.primary,
    },
    listContent: { paddingBottom: 24 },
});
