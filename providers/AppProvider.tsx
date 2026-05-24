import type { ReactNode } from "react";

import { AppForegroundSync } from "./AppForegroundSync";
import { DashboardProvider } from "./DashboardProvider";
import { MessagesProvider } from "./MessagesProvider";
import { ProfileProvider } from "./ProfileProvider";
import { SessionProvider } from "./SessionProvider";
import { ToastProvider } from "./ToastProvider";
import { UiPreferencesProvider } from "./UiPreferencesProvider";

export function AppProvider({ children }: { children: ReactNode }) {
    return (
        <ToastProvider>
            <SessionProvider>
                <ProfileProvider>
                    <DashboardProvider>
                        <MessagesProvider>
                            <UiPreferencesProvider>
                                <AppForegroundSync />
                                {children}
                            </UiPreferencesProvider>
                        </MessagesProvider>
                    </DashboardProvider>
                </ProfileProvider>
            </SessionProvider>
        </ToastProvider>
    );
}

export {
    useDashboard,
    useMessages,
    useProfile,
    useSession,
    useToast,
    useUiPreferences,
} from "./hooks";
