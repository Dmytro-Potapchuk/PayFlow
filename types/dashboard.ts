import type { Transaction } from "@/types/transaction";

export interface DashboardData {
    balance: number;
    balanceEur: number;
    balanceUsd: number;
    recentTransactions: Transaction[];
    unreadMessages: number;
}
