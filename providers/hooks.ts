import { useDashboardContext } from "./DashboardProvider";
import { useMessagesContext } from "./MessagesProvider";
import { useProfileContext } from "./ProfileProvider";
import { useSessionContext } from "./SessionProvider";
import { useToastContext } from "./ToastProvider";
import { useUiPreferencesContext } from "./UiPreferencesProvider";

export function useToast() {
    return useToastContext();
}

export function useSession() {
    return useSessionContext();
}

export function useProfile() {
    return useProfileContext();
}

export function useDashboard() {
    return useDashboardContext();
}

export function useMessages() {
    return useMessagesContext();
}

export function useUiPreferences() {
    return useUiPreferencesContext();
}
