import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import { getDashboard } from "@/api/dashboard.api";
import type { DashboardData } from "@/types/dashboard";

import { useSessionContext, useSessionToken } from "./SessionProvider";
import { useToastContext } from "./ToastProvider";
import type { RefreshOptions } from "./types";

const EMPTY_DASHBOARD: DashboardData = {
    balance: 0,
    balanceEur: 0,
    balanceUsd: 0,
    recentTransactions: [],
    unreadMessages: 0,
};

type DashboardContextValue = {
    dashboard: DashboardData;
    refreshDashboard: (options?: RefreshOptions) => Promise<DashboardData | null>;
};

const DashboardContext = createContext<DashboardContextValue | undefined>(
    undefined
);

export function DashboardProvider({ children }: { children: ReactNode }) {
    const token = useSessionToken();
    const { isAuthenticated } = useSessionContext();
    const { showToast } = useToastContext();
    const [dashboard, setDashboard] = useState<DashboardData>(EMPTY_DASHBOARD);

    const refreshDashboard = useCallback(
        async ({ silent = false }: RefreshOptions = {}) => {
            if (!token) {
                setDashboard(EMPTY_DASHBOARD);
                return null;
            }

            try {
                const data = await getDashboard(token);
                const normalized: DashboardData = {
                    balance: data.balance ?? 0,
                    balanceEur: data.balanceEur ?? 0,
                    balanceUsd: data.balanceUsd ?? 0,
                    recentTransactions: data.recentTransactions ?? [],
                    unreadMessages: data.unreadMessages ?? 0,
                };
                setDashboard(normalized);
                return normalized;
            } catch {
                if (!silent) {
                    showToast(
                        "Błąd",
                        "Nie udało się odświeżyć danych konta",
                        "error"
                    );
                }
                return null;
            }
        },
        [showToast, token]
    );

    useEffect(() => {
        if (!isAuthenticated) {
            setDashboard(EMPTY_DASHBOARD);
            return;
        }

        refreshDashboard({ silent: true }).catch(() => null);
    }, [isAuthenticated, refreshDashboard]);

    const value = useMemo<DashboardContextValue>(
        () => ({
            dashboard,
            refreshDashboard,
        }),
        [dashboard, refreshDashboard]
    );

    return (
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboardContext(): DashboardContextValue {
    const context = useContext(DashboardContext);

    if (!context) {
        throw new Error(
            "useDashboardContext must be used within DashboardProvider"
        );
    }

    return context;
}

export { EMPTY_DASHBOARD };
