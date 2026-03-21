import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
    RefreshControl,
} from "react-native";
import { useCallback, useState } from "react";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import BalanceCard from "@/components/BalanceCard";
import TransactionItem from "@/components/TransactionItem";
import AppButton from "@/components/AppButton";
import PwaInstallNotice from "@/components/PwaInstallNotice";
import { theme } from "@/constants/theme";
import { useAppState } from "@/providers/AppProvider";

export default function DashboardScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const { dashboard, refreshDashboard, unreadMessages } = useAppState();
    const { width } = useWindowDimensions();
    const isCompact = width <= 430;

    useFocusEffect(
        useCallback(() => {
            refreshDashboard({ silent: true });
        }, [refreshDashboard])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refreshDashboard({ silent: true });
        setRefreshing(false);
    }, [refreshDashboard]);

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[theme.colors.primary]}
                    />
                }
            >
                <View style={[styles.header, isCompact && styles.headerCompact]}>
                    <View>
                        <Text style={styles.greeting}>Witaj w PayFlow Demo</Text>
                        <Text style={styles.subtitle}>Twoje konto i ostatnia aktywność</Text>
                    </View>
                    <Pressable
                        style={styles.unreadCard}
                        onPress={() => router.push("/(tabs)/messages")}
                    >
                        <Ionicons
                            name="notifications-outline"
                            size={18}
                            color={theme.colors.primary}
                        />
                        <Text style={styles.unreadValue}>{unreadMessages}</Text>
                    </Pressable>
                </View>

                <View style={styles.notice}>
                    <Text style={styles.noticeTitle}>Tryb demonstracyjny</Text>
                    <Text style={styles.noticeText}>
                        Dane, saldo i płatności w tej aplikacji mają charakter testowy i
                        nie stanowią prawdziwych usług finansowych.
                    </Text>
                </View>

                <PwaInstallNotice compact={isCompact} />

                <BalanceCard
                    balance={dashboard.balance}
                    balanceEur={dashboard.balanceEur}
                    balanceUsd={dashboard.balanceUsd}
                />

                <View style={[styles.quickActions, isCompact && styles.quickActionsCompact]}>
                    <AppButton
                        title="Nowy przelew"
                        onPress={() => router.push("/(tabs)/transfer")}
                        style={styles.primaryBtn}
                    />
                    <AppButton
                        title="Doładuj konto"
                        onPress={() => router.push("/(tabs)/payu")}
                        variant="outline"
                        style={styles.secondaryBtn}
                    />
                </View>

                <View style={[styles.transactionsPanel, isCompact && styles.transactionsPanelCompact]}>
                    <View style={styles.transactionsPanelHeader}>
                        <Text style={styles.transactionsPanelTitle}>Ostatnie transakcje</Text>
                        <Text style={styles.transactionsPanelHint}>Ostatnie operacje na koncie</Text>
                    </View>
                    <View style={styles.transactionsList}>
                        {dashboard.recentTransactions.length > 0 ? (
                            dashboard.recentTransactions.map((item) => (
                                <TransactionItem key={item._id} transaction={item} />
                            ))
                        ) : (
                            <Text style={styles.empty}>Brak transakcji</Text>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    container: {
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.background,
        paddingBottom: 140,
        gap: theme.spacing.lg,
    },
    header: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: theme.spacing.md,
    },
    headerCompact: {
        flexDirection: "column",
        alignItems: "stretch",
    },
    unreadCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.xs,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.full,
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    unreadValue: {
        fontSize: 14,
        fontWeight: "700",
        color: theme.colors.primary,
    },
    notice: {
        backgroundColor: "#fff8e1",
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: "#ffe082",
        padding: theme.spacing.md,
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
        color: "#6d4c41",
    },
    greeting: {
        ...theme.typography.h1,
        color: theme.colors.text,
    },
    subtitle: {
        ...theme.typography.bodySmall,
        color: theme.colors.textMuted,
        marginTop: 4,
    },
    quickActions: {
        flexDirection: "row",
        gap: theme.spacing.sm,
    },
    quickActionsCompact: {
        flexDirection: "column",
    },
    primaryBtn: { flex: 1 },
    secondaryBtn: { flex: 1 },
    transactionsPanel: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.xl,
        paddingTop: theme.spacing.md,
        paddingHorizontal: theme.spacing.md,
        paddingBottom: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.md,
    },
    transactionsPanelCompact: {
        marginTop: theme.spacing.xs,
    },
    transactionsPanelHeader: {
        paddingBottom: theme.spacing.sm,
        marginBottom: theme.spacing.xs,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
    },
    transactionsPanelTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: theme.colors.text,
    },
    transactionsPanelHint: {
        marginTop: 4,
        fontSize: 12,
        color: theme.colors.textMuted,
    },
    transactionsList: {
        paddingTop: 4,
    },
    empty: {
        textAlign: "center",
        color: theme.colors.textMuted,
        marginTop: theme.spacing.xl,
    },
});
