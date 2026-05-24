import { useEffect } from "react";
import { router } from "expo-router";

import { useProfile, useSession, useToast } from "@/providers/AppProvider";

type UseRequireAdminResult = {
    isAdmin: boolean;
    isAllowed: boolean;
    isChecking: boolean;
};

export function useRequireAdmin(): UseRequireAdminResult {
    const { profile } = useProfile();
    const { isReady } = useSession();
    const { showToast } = useToast();
    const isAdmin = profile?.role === "admin";
    const isAllowed = isReady && isAdmin;
    const isChecking = !isReady;

    useEffect(() => {
        if (!isReady) {
            return;
        }

        if (!isAdmin) {
            showToast("Błąd", "Brak uprawnień administratora", "error");
            router.replace("/(tabs)");
        }
    }, [isAdmin, isReady, showToast]);

    return { isAdmin, isAllowed, isChecking };
}
