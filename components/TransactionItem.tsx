import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Transaction } from "@/types/transaction";
import { theme } from "@/constants/theme";
import { useProfile, useUiPreferences } from "@/providers/AppProvider";

type TransactionDisplay = {
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    label: string;
    detail: string;
    amountPrefix: string;
};

function getTransactionDisplay(
    transaction: Transaction,
    profileId: string | undefined,
    showSensitiveData: boolean
): TransactionDisplay {
    const isTransfer = transaction.type === "bank_transfer";
    const isOutgoingTransfer =
        isTransfer && Boolean(profileId) && transaction.senderId === profileId;
    const isIncomingTransfer = isTransfer && !isOutgoingTransfer;

    if (isIncomingTransfer) {
        return {
            icon: "arrow-back",
            iconColor: theme.colors.success,
            label: "Przelew przychodzący",
            detail: "Wpływ na konto",
            amountPrefix: "+",
        };
    }

    if (isOutgoingTransfer) {
        const detail =
            transaction.receiverAccount && showSensitiveData
                ? `Do: ${transaction.receiverAccount}`
                : transaction.receiverAccount
                  ? `Do: ${transaction.receiverAccount.slice(0, 2)}••••`
                  : "Doładowanie salda";

        return {
            icon: "arrow-forward",
            iconColor: theme.colors.error,
            label: "Przelew wychodzący",
            detail,
            amountPrefix: "-",
        };
    }

    return {
        icon: "card",
        iconColor: theme.colors.primary,
        label: "Doładowanie",
        detail: "Doładowanie salda",
        amountPrefix: "+",
    };
}

export default function TransactionItem({ transaction }: { transaction: Transaction }) {
    const { profile } = useProfile();
    const { showSensitiveData } = useUiPreferences();
    const display = getTransactionDisplay(
        transaction,
        profile?._id,
        showSensitiveData
    );

    return (
        <View style={styles.row}>
            <View
                style={[
                    styles.iconWrap,
                    { backgroundColor: `${display.iconColor}18` },
                ]}
            >
                <Ionicons
                    name={display.icon}
                    size={20}
                    color={display.iconColor}
                />
            </View>
            <View style={styles.content}>
                <Text style={styles.type}>{display.label}</Text>
                <Text style={styles.detail}>{display.detail}</Text>
            </View>
            <Text style={[styles.amount, { color: display.iconColor }]}>
                {display.amountPrefix}
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
