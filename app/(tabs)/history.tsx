import {
    View,
    Text,
    FlatList,
    StyleSheet,
    RefreshControl,
    SafeAreaView,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { getToken } from "@/api/authStorage";
import { apiRequest } from "@/api/api";
import { Transaction } from "@/types/transaction";
import TransactionItem from "@/components/TransactionItem";
import { theme } from "@/constants/theme";

export default function HistoryScreen() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const loadHistory = useCallback(async () => {
        const token = await getToken();
        const data = await apiRequest<Transaction[]>(
            "/transactions/history",
            "GET",
            undefined,
            token || ""
        );
        setTransactions(Array.isArray(data) ? data : []);
    }, []);

    useEffect(() => {
        setLoading(true);
        loadHistory().finally(() => setLoading(false));
    }, [loadHistory]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadHistory();
        setRefreshing(false);
    }, [loadHistory]);

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Historia operacji-payflow 123</Text>
                    <Text style={styles.subtitle}>
                        Wszystkie Twoje transakcje
                    </Text>
                </View>

                {loading ? (
                    <View style={styles.center}>
                        <Text style={styles.loadingText}>Ładowanie...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={transactions}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <TransactionItem transaction={item} />
                        )}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <Text style={styles.empty}>
                                Brak transakcji
                            </Text>
                        }
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[theme.colors.primary]}
                            />
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    container: {
        flex: 1,
        padding: theme.spacing.lg,
    },
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
    listContent: { paddingBottom: 24 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    loadingText: {
        color: theme.colors.textMuted,
    },
    empty: {
        textAlign: "center",
        color: theme.colors.textMuted,
        marginTop: theme.spacing.xl,
    },
});
