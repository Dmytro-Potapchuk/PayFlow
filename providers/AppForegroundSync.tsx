import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { useDashboardContext } from "./DashboardProvider";
import { useProfileContext } from "./ProfileProvider";
import { useSessionContext } from "./SessionProvider";

export function AppForegroundSync() {
    const { isAuthenticated } = useSessionContext();
    const { refreshProfile } = useProfileContext();
    const { refreshDashboard } = useDashboardContext();
    const appStateRef = useRef<AppStateStatus>(AppState.currentState ?? "active");

    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }

        const subscription = AppState.addEventListener("change", (nextState) => {
            const becameActive =
                appStateRef.current.match(/inactive|background/) &&
                nextState === "active";

            appStateRef.current = nextState;

            if (becameActive) {
                refreshDashboard({ silent: true }).catch(() => null);
                refreshProfile({ silent: true }).catch(() => null);
            }
        });

        return () => {
            subscription.remove();
        };
    }, [isAuthenticated, refreshDashboard, refreshProfile]);

    return null;
}
