import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    SafeAreaView,
} from "react-native";
import { useEffect, useState } from "react";

import { getRates, buyCurrency } from "@/api/currency.api";
import { getToken } from "@/api/authStorage";
import { getErrorMessage } from "@/utils/errorMessage";
import AppInput from "@/components/AppInput";
import AppButton from "@/components/AppButton";
import { theme } from "@/constants/theme";

interface Rate {
    code: string;
    currency: string;
    mid: number;
}

export default function CurrencyScreen() {
    const [rates, setRates] = useState<Rate[]>([]);
    const [loading, setLoading] = useState(false);
    const [amountPln, setAmountPln] = useState("");
    const [selected, setSelected] = useState<Rate | null>(null);
    const [result, setResult] = useState<string | null>(null);
    const [buying, setBuying] = useState(false);

    useEffect(() => {
        loadRates();
    }, []);

    const loadRates = async () => {
        try {
            setLoading(true);
            const data = await getRates();
            setRates(data);
        } catch {
            Alert.alert("Błąd", "Nie udało się pobrać kursów walut");
        } finally {
            setLoading(false);
        }
    };

    const handleConvert = () => {
        if (!selected) {
            Alert.alert("Błąd", "Wybierz walutę");
            return;
        }
        const amount = Number(amountPln);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert("Błąd", "Podaj poprawną kwotę w PLN");
            return;
        }
        const foreignAmount = amount / selected.mid;
        setResult(`${amount.toFixed(2)} PLN = ${foreignAmount.toFixed(2)} ${selected.code}`);
    };

    const canBuy = selected && (selected.code === "EUR" || selected.code === "USD");

    const handleBuy = async () => {
        if (!canBuy) {
            Alert.alert("Błąd", "Kupno możliwe tylko dla EUR lub USD");
            return;
        }
        const amount = Number(amountPln);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert("Błąd", "Podaj poprawną kwotę w PLN");
            return;
        }
        try {
            setBuying(true);
            const token = await getToken();
            if (!token) {
                Alert.alert("Błąd", "Zaloguj się, aby kupić walutę");
                return;
            }
            const res = await buyCurrency(amount, selected!.code, token);
            Alert.alert(
                "Sukces",
                `Kupiono ${res.boughtAmount.toFixed(2)} ${res.currencyCode}.\n` +
                    `Saldo PLN: ${res.balance.toFixed(2)}\n` +
                    `Saldo EUR: ${(res.balanceEur ?? 0).toFixed(2)}\n` +
                    `Saldo USD: ${(res.balanceUsd ?? 0).toFixed(2)}`
            );
            setAmountPln("");
            setResult(null);
        } catch (err: unknown) {
            Alert.alert("Błąd", getErrorMessage(err, "Nie udało się kupić waluty"));
        } finally {
            setBuying(false);
        }
    };

    const renderItem = ({ item }: { item: Rate }) => {
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
    };

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
                        />
                        {canBuy && (
                            <AppButton
                                title={buying ? "..." : "Kup walutę"}
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
                        keyboardShouldPersistTaps="never"
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
