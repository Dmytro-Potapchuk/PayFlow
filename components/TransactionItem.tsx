import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Transaction } from "@/types/transaction";
import { theme } from "@/constants/theme";
import { useAppState } from "@/providers/AppProvider";

export default function TransactionItem({ transaction }: { transaction: Transaction }) {
    const { showSensitiveData } = useAppState();
    const isTransfer = transaction.type === "bank_transfer";
    const icon = isTransfer ? "arrow-forward" : "card";
    const label = isTransfer ? "Przelew" : "Doładowanie";
    const receiverLabel = transaction.receiverAccount
        ? showSensitiveData
            ? transaction.receiverAccount
            : `${transaction.receiverAccount.slice(0, 2)}••••`
        : null;

    return (
        <View style={styles.row}>
            <View style={styles.iconWrap}>
                <Ionicons
                    name={icon as "arrow-forward"}
                    size={20}
                    color={theme.colors.primary}
                />
            </View>
            <View style={styles.content}>
                <Text style={styles.type}>{label}</Text>
                {receiverLabel && (
                    <Text style={styles.detail}>{receiverLabel}</Text>
                )}
            </View>
            <Text style={styles.amount}>{transaction.amount} PLN</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        marginBottom: theme.spacing.xs,
        borderRadius: theme.radius.md,
        ...theme.shadows.sm,
    },
    iconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.border,
        alignItems: "center",
        justifyContent: "center",
        marginRight: theme.spacing.md,
    },
    content: { flex: 1 },
    type: {
        fontSize: 16,
        fontWeight: "600",
        color: theme.colors.text,
    },
    detail: {
        fontSize: 13,
        color: theme.colors.textMuted,
        marginTop: 2,
    },
    amount: {
        fontSize: 16,
        fontWeight: "600",
        color: theme.colors.text,
    },
});
