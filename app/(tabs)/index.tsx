import {
    View,
    FlatList,
    StyleSheet,
    Text,
    RefreshControl,
    SafeAreaView,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { router } from "expo-router";

import { getDashboard } from "@/api/dashboard.api";
import { getToken } from "@/api/authStorage";
import { Transaction } from "@/types/transaction";
import BalanceCard from "@/components/BalanceCard";
import TransactionItem from "@/components/TransactionItem";
import AppButton from "@/components/AppButton";
import { theme } from "@/constants/theme";

export default function DashboardScreen() {
    const [balance, setBalance] = useState(0);
    const [balanceEur, setBalanceEur] = useState(0);
    const [balanceUsd, setBalanceUsd] = useState(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        const token = await getToken();
        const data = await getDashboard(token || "");
        setBalance(data.balance);
        setBalanceEur(data.balanceEur ?? 0);
        setBalanceUsd(data.balanceUsd ?? 0);
        setTransactions((data.recentTransactions ?? []) as Transaction[]);
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    }, [load]);

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.greeting}>Witaj w PayFlow</Text>
                    <Text style={styles.subtitle}>Twoje konto</Text>
                </View>

                <BalanceCard
                    balance={balance}
                    balanceEur={balanceEur}
                    balanceUsd={balanceUsd}
                />

                <AppButton
                    title="Nowy przelew"
                    onPress={() => router.push("/(tabs)/transfer")}
                    style={styles.primaryBtn}
                />

                <Text style={styles.sectionTitle}>Ostatnie transakcje</Text>

                <FlatList
                    data={transactions}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <TransactionItem transaction={item} />
                    )}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <Text style={styles.empty}>Brak transakcji</Text>
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[theme.colors.primary]}
                        />
                    }
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    container: {
        flex: 1,
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.background,
    },
    header: { marginBottom: theme.spacing.lg },
    greeting: {
        ...theme.typography.h1,
        color: theme.colors.text,
    },
    subtitle: {
        ...theme.typography.bodySmall,
        color: theme.colors.textMuted,
        marginTop: 4,
    },
    primaryBtn: { marginBottom: theme.spacing.lg },
    sectionTitle: {
        ...theme.typography.h3,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    listContent: { paddingBottom: 24 },
    empty: {
        textAlign: "center",
        color: theme.colors.textMuted,
        marginTop: theme.spacing.xl,
    },
});
