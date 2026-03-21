import { Tabs } from "expo-router";

import AppTabBar from "@/components/AppTabBar";
import { theme } from "@/constants/theme";
import { useAppState } from "@/providers/AppProvider";

export default function TabsLayout() {
    const { profile } = useAppState();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textMuted,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopColor: theme.colors.border,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "500",
                },
            }}
            tabBar={(props) => <AppTabBar {...props} />}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Dashboard",
                }}
            />

            <Tabs.Screen
                name="transfer"
                options={{
                    title: "Przelew",
                }}
            />

            <Tabs.Screen
                name="payu"
                options={{
                    title: "Doładowanie",
                }}
            />

            <Tabs.Screen
                name="currency"
                options={{
                    title: "Waluty",
                    href: null,
                }}
            />

            <Tabs.Screen
                name="history"
                options={{
                    title: "Historia",
                    href: null,
                }}
            />

            <Tabs.Screen
                name="messages"
                options={{
                    title: "Wiadomości",
                }}
            />

            {profile?.role === "admin" && (
                <Tabs.Screen
                    name="admin"
                    options={{
                        title: "Admin",
                        href: null,
                    }}
                />
            )}

            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profil",
                    href: null,
                }}
            />
        </Tabs>
    );
}