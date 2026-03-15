import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/constants/theme";

type Props = {
    balance: number;
    balanceEur?: number;
    balanceUsd?: number;
};

export default function BalanceCard({ balance, balanceEur = 0, balanceUsd = 0 }: Props) {
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.chip} />
                <Ionicons name="wifi" size={24} color="rgba(255,255,255,0.8)" />
            </View>
            <Text style={styles.label}>Saldo dostępne</Text>
            <Text style={styles.amount}>{balance.toFixed(2)} PLN</Text>
            {(balanceEur > 0 || balanceUsd > 0) && (
                <View style={styles.foreign}>
                    {balanceEur > 0 && (
                        <Text style={styles.foreignText}>EUR {balanceEur.toFixed(2)}</Text>
                    )}
                    {balanceUsd > 0 && (
                        <Text style={styles.foreignText}>USD {balanceUsd.toFixed(2)}</Text>
                    )}
                </View>
            )}
            <View style={styles.footer}>
                <Text style={styles.cardNumber}>PayFlow •••• 4242</Text>
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
    chip: {
        width: 40,
        height: 32,
        backgroundColor: "rgba(255,255,255,0.3)",
        borderRadius: 6,
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
});
