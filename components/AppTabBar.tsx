import { useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { theme } from "@/constants/theme";
import { useAppState } from "@/providers/AppProvider";

const PRIMARY_TABS = [
    {
        routeName: "index",
        label: "Start",
        icon: "home-outline",
        activeIcon: "home",
    },
    {
        routeName: "transfer",
        label: "Przelew",
        icon: "paper-plane-outline",
        activeIcon: "paper-plane",
    },
    {
        routeName: "payu",
        label: "Doładuj",
        icon: "card-outline",
        activeIcon: "card",
    },
    {
        routeName: "messages",
        label: "Wiadomości",
        icon: "chatbubble-ellipses-outline",
        activeIcon: "chatbubble-ellipses",
    },
] as const;

const HIDDEN_ROUTE_META: Record<
    string,
    { label: string; icon: keyof typeof Ionicons.glyphMap; description: string }
> = {
    history: {
        label: "Historia",
        icon: "time-outline",
        description: "Lista ostatnich operacji i przelewów",
    },
    currency: {
        label: "Waluty",
        icon: "cash-outline",
        description: "Kursy, przelicznik i zakup EUR/USD",
    },
    profile: {
        label: "Profil",
        icon: "person-outline",
        description: "Dane konta, ustawienia i wylogowanie",
    },
    admin: {
        label: "Admin",
        icon: "settings-outline",
        description: "Zarządzanie użytkownikami i rolami",
    },
};

export default function AppTabBar({ state, navigation }: BottomTabBarProps) {
    const { profile, unreadMessages } = useAppState();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const fade = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(18)).current;

    const currentRouteName = state.routes[state.index]?.name;
    const moreMenuItems = useMemo(
        () =>
            state.routes
                .map((route) => ({
                    routeName: route.name,
                    ...HIDDEN_ROUTE_META[route.name],
                }))
                .filter(
                    (route) =>
                        route.label &&
                        (route.routeName !== "admin" || profile?.role === "admin")
                ),
        [profile?.role, state.routes]
    );

    const isMoreActive = Boolean(
        currentRouteName &&
            !PRIMARY_TABS.some((tab) => tab.routeName === currentRouteName)
    );

    useEffect(() => {
        if (isMenuOpen) {
            Animated.parallel([
                Animated.timing(fade, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            fade.setValue(0);
            translateY.setValue(18);
        }
    }, [fade, isMenuOpen, translateY]);

    return (
        <>
            <View style={styles.wrapper}>
                <View style={styles.inner}>
                    {PRIMARY_TABS.map((tab) => {
                        const routeIndex = state.routes.findIndex(
                            (route) => route.name === tab.routeName
                        );

                        if (routeIndex === -1) {
                            return null;
                        }

                        const isFocused = state.index === routeIndex;

                        return (
                            <Pressable
                                key={tab.routeName}
                                accessibilityRole="button"
                                style={styles.tabButton}
                                onPress={() => navigation.navigate(tab.routeName)}
                            >
                                <View style={styles.iconSlot}>
                                    <Ionicons
                                        name={
                                            (isFocused ? tab.activeIcon : tab.icon) as keyof typeof Ionicons.glyphMap
                                        }
                                        size={22}
                                        color={
                                            isFocused
                                                ? theme.colors.primary
                                                : theme.colors.textMuted
                                        }
                                    />
                                    {tab.routeName === "messages" &&
                                        unreadMessages > 0 && (
                                            <View style={styles.badge}>
                                                <Text style={styles.badgeText}>
                                                    {unreadMessages > 9
                                                        ? "9+"
                                                        : unreadMessages}
                                                </Text>
                                            </View>
                                        )}
                                </View>
                                <Text
                                    style={[
                                        styles.tabLabel,
                                        isFocused && styles.tabLabelActive,
                                    ]}
                                >
                                    {tab.label}
                                </Text>
                            </Pressable>
                        );
                    })}

                    <Pressable
                        accessibilityRole="button"
                        style={styles.tabButton}
                        onPress={() => setIsMenuOpen(true)}
                    >
                        <View style={styles.iconSlot}>
                            <Ionicons
                                name={isMoreActive ? "ellipsis-horizontal-circle" : "ellipsis-horizontal-circle-outline"}
                                size={22}
                                color={
                                    isMoreActive
                                        ? theme.colors.primary
                                        : theme.colors.textMuted
                                }
                            />
                        </View>
                        <Text
                            style={[
                                styles.tabLabel,
                                isMoreActive && styles.tabLabelActive,
                            ]}
                        >
                            Więcej
                        </Text>
                    </Pressable>
                </View>
            </View>

            <Modal
                visible={isMenuOpen}
                transparent
                animationType="none"
                onRequestClose={() => setIsMenuOpen(false)}
            >
                <Pressable
                    style={styles.modalBackdrop}
                    onPress={() => setIsMenuOpen(false)}
                >
                    <Animated.View
                        style={[
                            styles.menuSheet,
                            {
                                opacity: fade,
                                transform: [{ translateY }],
                            },
                        ]}
                    >
                        <Text style={styles.menuTitle}>Więcej funkcji</Text>
                        <Text style={styles.menuSubtitle}>
                            Szybki dostęp do pozostałych modułów
                        </Text>

                        {moreMenuItems.map((item) => (
                            <Pressable
                                key={item.routeName}
                                style={styles.menuItem}
                                onPress={() => {
                                    setIsMenuOpen(false);
                                    navigation.navigate(item.routeName);
                                }}
                            >
                                <View style={styles.menuIconWrap}>
                                    <Ionicons
                                        name={item.icon}
                                        size={20}
                                        color={theme.colors.primary}
                                    />
                                </View>
                                <View style={styles.menuTextWrap}>
                                    <Text style={styles.menuItemLabel}>
                                        {item.label}
                                    </Text>
                                    <Text style={styles.menuItemDescription}>
                                        {item.description}
                                    </Text>
                                </View>
                                <Ionicons
                                    name="chevron-forward"
                                    size={18}
                                    color={theme.colors.textMuted}
                                />
                            </Pressable>
                        ))}
                    </Animated.View>
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.sm,
        paddingBottom: Platform.select({ ios: 26, default: theme.spacing.md }),
        backgroundColor: "transparent",
    },
    inner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.xl,
        paddingVertical: 10,
        paddingHorizontal: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.lg,
    },
    tabButton: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        minHeight: 56,
    },
    iconSlot: {
        minWidth: 28,
        alignItems: "center",
        justifyContent: "center",
    },
    tabLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: theme.colors.textMuted,
    },
    tabLabelActive: {
        color: theme.colors.primary,
    },
    badge: {
        position: "absolute",
        top: -6,
        right: -10,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        paddingHorizontal: 4,
        backgroundColor: theme.colors.error,
        alignItems: "center",
        justifyContent: "center",
    },
    badgeText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "700",
    },
    modalBackdrop: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(12, 20, 44, 0.28)",
        padding: theme.spacing.md,
    },
    menuSheet: {
        alignSelf: "center",
        width: "100%",
        maxWidth: 540,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.xl,
        padding: theme.spacing.lg,
        gap: theme.spacing.sm,
        ...theme.shadows.lg,
    },
    menuTitle: {
        ...theme.typography.h2,
        color: theme.colors.text,
    },
    menuSubtitle: {
        ...theme.typography.bodySmall,
        color: theme.colors.textMuted,
        marginBottom: theme.spacing.sm,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.md,
        borderRadius: theme.radius.lg,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.sm,
        backgroundColor: theme.colors.background,
    },
    menuIconWrap: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.surface,
    },
    menuTextWrap: {
        flex: 1,
        gap: 2,
    },
    menuItemLabel: {
        fontSize: 15,
        fontWeight: "700",
        color: theme.colors.text,
    },
    menuItemDescription: {
        fontSize: 12,
        color: theme.colors.textMuted,
        lineHeight: 17,
    },
});
