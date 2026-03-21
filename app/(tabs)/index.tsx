import {
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    FlatList,
    RefreshControl,
} from "react-native";
import { useCallback, useState } from "react";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import BalanceCard from "@/components/BalanceCard";
import TransactionItem from "@/components/TransactionItem";
import AppButton from "@/components/AppButton";
import { theme } from "@/constants/theme";
import { useAppState } from "@/providers/AppProvider";

export default function DashboardScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const { dashboard, refreshDashboard, unreadMessages } = useAppState();

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
            <View style={styles.container}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Witaj w PayFlow</Text>
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

                <BalanceCard
                    balance={dashboard.balance}
                    balanceEur={dashboard.balanceEur}
                    balanceUsd={dashboard.balanceUsd}
                />

                <View style={styles.quickActions}>
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

                <Text style={styles.sectionTitle}>Ostatnie transakcje</Text>

                <FlatList
                    data={dashboard.recentTransactions}
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
    header: {
        marginBottom: theme.spacing.lg,
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: theme.spacing.md,
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
        marginBottom: theme.spacing.lg,
    },
    primaryBtn: { flex: 1 },
    secondaryBtn: { flex: 1 },
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
