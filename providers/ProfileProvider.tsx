import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import { getProfile } from "@/api/users.api";
import type { UserProfile } from "@/types/api.types";

import { useSessionContext, useSessionToken } from "./SessionProvider";
import type { RefreshOptions } from "./types";

type ProfileContextValue = {
    profile: UserProfile | null;
    refreshProfile: (options?: RefreshOptions) => Promise<UserProfile | null>;
};

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
    const token = useSessionToken();
    const { isAuthenticated } = useSessionContext();
    const [profile, setProfile] = useState<UserProfile | null>(null);

    const refreshProfile = useCallback(
        async (_options?: RefreshOptions) => {
            if (!token) {
                setProfile(null);
                return null;
            }

            try {
                const data = await getProfile(token);
                setProfile(data);
                return data;
            } catch {
                return null;
            }
        },
        [token]
    );

    useEffect(() => {
        if (!isAuthenticated) {
            setProfile(null);
            return;
        }

        refreshProfile().catch(() => null);
    }, [isAuthenticated, refreshProfile]);

    const value = useMemo<ProfileContextValue>(
        () => ({
            profile,
            refreshProfile,
        }),
        [profile, refreshProfile]
    );

    return (
        <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
    );
}

export function useProfileContext(): ProfileContextValue {
    const context = useContext(ProfileContext);

    if (!context) {
        throw new Error("useProfileContext must be used within ProfileProvider");
    }

    return context;
}
