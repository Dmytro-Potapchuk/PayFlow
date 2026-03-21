import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { theme } from "@/constants/theme";
import { useAppState } from "@/providers/AppProvider";

type Props = {
    balance: number;
    balanceEur?: number;
    balanceUsd?: number;
};

export default function BalanceCard({ balance, balanceEur = 0, balanceUsd = 0 }: Props) {
    const { showSensitiveData, toggleSensitiveData } = useAppState();

    const maskValue = (value: number, currency: string) =>
        showSensitiveData ? `${value.toFixed(2)} ${currency}` : "••••••";

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.chip} />
                <View style={styles.headerActions}>
                    <Pressable
                        onPress={toggleSensitiveData}
                        style={styles.eyeButton}
                        accessibilityRole="button"
                        accessibilityLabel={
                            showSensitiveData ? "Ukryj wrażliwe dane" : "Pokaż wrażliwe dane"
                        }
                    >
                        <Ionicons
                            name={showSensitiveData ? "eye-off-outline" : "eye-outline"}
                            size={20}
                            color="#fff"
                        />
                    </Pressable>
                    <Ionicons name="wifi" size={24} color="rgba(255,255,255,0.8)" />
                </View>
            </View>
            <Text style={styles.label}>Saldo dostępne</Text>
            <Text style={styles.amount}>{maskValue(balance, "PLN")}</Text>
            {(balanceEur > 0 || balanceUsd > 0) && (
                <View style={styles.foreign}>
                    {balanceEur > 0 && (
                        <Text style={styles.foreignText}>
                            EUR {showSensitiveData ? balanceEur.toFixed(2) : "••••"}
                        </Text>
                    )}
                    {balanceUsd > 0 && (
                        <Text style={styles.foreignText}>
                            USD {showSensitiveData ? balanceUsd.toFixed(2) : "••••"}
                        </Text>
                    )}
                </View>
            )}
            <View style={styles.footer}>
                <Text style={styles.cardNumber}>
                    {showSensitiveData ? "PayFlow 1234 5678 9012 4242" : "PayFlow •••• 4242"}
                </Text>
                <Text style={styles.footerHint}>
                    {showSensitiveData
                        ? "Pełne dane są widoczne tylko tymczasowo"
                        : "Dotknij ikony oka, aby zobaczyć pełne dane"}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
        ...theme.shadows.lg,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: theme.spacing.xl,
    },
    headerActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.sm,
    },
    chip: {
        width: 40,
        height: 32,
        backgroundColor: "rgba(255,255,255,0.3)",
        borderRadius: 6,
    },
    eyeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.18)",
    },
    label: {
        fontSize: 14,
        color: "rgba(255,255,255,0.8)",
        marginBottom: 4,
    },
    amount: {
        fontSize: 28,
        fontWeight: "700",
        color: "#fff",
        letterSpacing: 1,
    },
    foreign: {
        flexDirection: "row",
        gap: 16,
        marginTop: 12,
    },
    foreignText: {
        fontSize: 14,
        color: "rgba(255,255,255,0.85)",
    },
    footer: {
        marginTop: theme.spacing.lg,
        paddingTop: theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.2)",
    },
    cardNumber: {
        fontSize: 12,
        color: "rgba(255,255,255,0.7)",
        letterSpacing: 2,
    },
    footerHint: {
        marginTop: theme.spacing.xs,
        fontSize: 12,
        color: "rgba(255,255,255,0.7)",
    },
});
