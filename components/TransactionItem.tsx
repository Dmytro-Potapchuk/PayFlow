import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Transaction } from "@/types/transaction";
import { theme } from "@/constants/theme";
import { useAppState } from "@/providers/AppProvider";

export default function TransactionItem({ transaction }: { transaction: Transaction }) {
    const { profile, showSensitiveData } = useAppState();
    const isTransfer = transaction.type === "bank_transfer";
    const isOutgoingTransfer =
        isTransfer && Boolean(profile?._id) && transaction.senderId === profile?._id;
    const isIncomingTransfer = isTransfer && !isOutgoingTransfer;

    const icon = isIncomingTransfer
        ? "arrow-back"
        : isOutgoingTransfer
          ? "arrow-forward"
          : "card";
    const iconColor = isIncomingTransfer
        ? theme.colors.success
        : isOutgoingTransfer
          ? theme.colors.error
          : theme.colors.primary;
    const label = isIncomingTransfer
        ? "Przelew przychodzący"
        : isOutgoingTransfer
          ? "Przelew wychodzący"
          : "Doładowanie";
    const receiverLabel =
        isOutgoingTransfer && transaction.receiverAccount
            ? showSensitiveData
                ? `Do: ${transaction.receiverAccount}`
                : `Do: ${transaction.receiverAccount.slice(0, 2)}••••`
            : isIncomingTransfer
              ? "Wpływ na konto"
              : "Doładowanie salda";
    const amountPrefix = isIncomingTransfer ? "+" : isOutgoingTransfer ? "-" : "+";

    return (
        <View style={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: `${iconColor}18` }]}>
                <Ionicons
                    name={icon as "arrow-forward"}
                    size={20}
                    color={iconColor}
                />
            </View>
            <View style={styles.content}>
                <Text style={styles.type}>{label}</Text>
                <Text style={styles.detail}>{receiverLabel}</Text>
            </View>
            <Text style={[styles.amount, { color: iconColor }]}>
                {amountPrefix}
                {transaction.amount} PLN
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        minHeight: 68,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        marginBottom: theme.spacing.sm,
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
