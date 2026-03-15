import { useEffect, useState } from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { getToken } from "@/api/authStorage";
import { getProfile } from "@/api/users.api";
import { theme } from "@/constants/theme";

export default function TabsLayout() {

    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const loadRole = async () => {
            try {
                const token = await getToken();
                if (!token) {
                    setRole(null);
                    return;
                }
                const user = await getProfile(token);
                setRole(user.role ?? null);
            } catch {
                setRole(null);
            }
        };

        loadRole();
    }, []);

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
        >

            <Tabs.Screen
                name="index"
                options={{
                    title: "Dashboard",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="transfer"
                options={{
                    title: "Przelew",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="paper-plane-outline" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="payu"
                options={{
                    title: "Doładowanie",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="card-outline" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="currency"
                options={{
                    title: "Waluty",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="cash-outline" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="history"
                options={{
                    title: "Historia",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="time-outline" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="messages"
                options={{
                    title: "Wiadomości",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />
                    ),
                }}
            />

            {role === "admin" && (
                <Tabs.Screen
                    name="admin"
                    options={{
                        title: "Admin",
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="settings-outline" size={size} color={color} />
                        ),
                    }}
                />
            )}

            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profil",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                }}
            />

        </Tabs>
    );
}

