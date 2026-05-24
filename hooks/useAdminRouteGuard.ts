import { useEffect } from "react";
import { router, useSegments } from "expo-router";

import { useProfile, useSession, useToast } from "@/providers/AppProvider";

/**
 * Blocks deep-link / manual navigation to admin routes for non-admins.
 */
export function useAdminRouteGuard(): void {
    const segments = useSegments();
    const { profile } = useProfile();
    const { isReady } = useSession();
    const { showToast } = useToast();

    useEffect(() => {
        if (!isReady) {
            return;
        }

        const onAdminRoute = segments.includes("admin");

        if (onAdminRoute && profile?.role !== "admin") {
            showToast("Błąd", "Brak uprawnień administratora", "error");
            router.replace("/(tabs)");
        }
    }, [isReady, profile?.role, segments, showToast]);
}
