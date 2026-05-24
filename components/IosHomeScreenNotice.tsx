import { useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { theme } from "@/constants/theme";

const DISMISS_STORAGE_KEY = "payflow-ios-homescreen-notice-dismissed";

type Props = {
    compact?: boolean;
};

function readDismissedFromStorage() {
    if (Platform.OS !== "web" || typeof window === "undefined") {
        return false;
    }

    try {
        return window.localStorage.getItem(DISMISS_STORAGE_KEY) === "1";
    } catch {
        return false;
    }
}

function persistDismissed() {
    if (Platform.OS !== "web" || typeof window === "undefined") {
        return;
    }

    try {
        window.localStorage.setItem(DISMISS_STORAGE_KEY, "1");
    } catch {
        // Ignore storage failures in private browsing or restricted contexts.
    }
}

export default function IosHomeScreenNotice({ compact = false }: Props) {
    const [dismissed, setDismissed] = useState(readDismissedFromStorage);

    const shouldShow = useMemo(() => {
        if (Platform.OS !== "web" || dismissed || typeof window === "undefined") {
            return false;
        }

        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIos = /iphone|ipad|ipod/.test(userAgent);
        const isSafari =
            /safari/.test(userAgent) &&
            !/crios|fxios|edgios|opios|mercury/.test(userAgent);
        const isStandalone = Boolean(
            (window.navigator as Navigator & { standalone?: boolean }).standalone
        );

        return isIos && isSafari && !isStandalone;
    }, [dismissed]);

    const handleDismiss = () => {
        setDismissed(true);
        persistDismissed();
    };

    if (!shouldShow) {
        return null;
    }

    return (
        <View style={[styles.card, compact && styles.cardCompact]}>
            <View style={styles.header}>
                <View style={styles.titleWrap}>
                    <Ionicons
                        name="phone-portrait-outline"
                        size={18}
                        color={theme.colors.primary}
                    />
                    <Text style={styles.title}>Zainstaluj na iPhone</Text>
                </View>
                <Pressable onPress={handleDismiss} style={styles.closeButton}>
                    <Ionicons
                        name="close"
                        size={18}
                        color={theme.colors.textMuted}
                    />
                </Pressable>
            </View>
            <Text style={styles.text}>
                Otwórz menu Safari, wybierz `Udostępnij`, a następnie `Dodaj do
                ekranu początkowego`, aby dodać PayFlow Demo do ekranu głównego.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.iosNoticeBackground,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.iosNoticeBorder,
        padding: theme.spacing.md,
        gap: theme.spacing.sm,
    },
    cardCompact: {
        marginTop: theme.spacing.xs,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: theme.spacing.sm,
    },
    titleWrap: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.xs,
    },
    title: {
        fontSize: 14,
        fontWeight: "700",
        color: theme.colors.primary,
    },
    text: {
        fontSize: 13,
        lineHeight: 18,
        color: theme.colors.textSecondary,
    },
    closeButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.surface,
    },
});
