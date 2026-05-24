import {
    View,
    Text,
    FlatList,
    StyleSheet,
    RefreshControl,
    SafeAreaView,
} from "react-native";
import { useState, useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";

import { getHistory } from "@/api/transactions.api";
import { useRequireAuthToken } from "@/hooks/useRequireAuthToken";
import { Transaction } from "@/types/transaction";
import TransactionItem from "@/components/TransactionItem";
import { theme } from "@/constants/theme";
import { logError } from "@/utils/logError";

export default function HistoryScreen() {
    const { requireToken } = useRequireAuthToken();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [errorText, setErrorText] = useState<string | null>(null);
    const isMountedRef = useRef(true);

    const loadHistory = useCallback(async () => {
        try {
            const token = requireToken();

            if (!token) {
                if (isMountedRef.current) {
                    setTransactions([]);
                    setErrorText("Brak sesji – zaloguj się ponownie.");
                }
                return;
            }

            const data = await getHistory(token);

            if (!isMountedRef.current) {
                return;
            }

            setTransactions(data);
            setErrorText(null);
        } catch (error: unknown) {
            logError("history.load", error);

            if (isMountedRef.current) {
                setTransactions([]);
                setErrorText("Nie udało się pobrać historii transakcji.");
            }
        }
    }, [requireToken]);

    useFocusEffect(
        useCallback(() => {
            isMountedRef.current = true;
            setLoading(true);

            loadHistory().finally(() => {
                if (isMountedRef.current) {
                    setLoading(false);
                }
            });

            return () => {
                isMountedRef.current = false;
            };
        }, [loadHistory])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);

        try {
            await loadHistory();
        } finally {
            if (isMountedRef.current) {
                setRefreshing(false);
            }
        }
    }, [loadHistory]);

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Historia operacji</Text>
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
                                {errorText ?? "Brak transakcji"}
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
