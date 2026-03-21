import { useEffect, useRef } from "react";
import {
    Animated,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAppState } from "@/providers/AppProvider";
import type { MessageType } from "@/types/message";
import { theme } from "@/constants/theme";

function getToastAccent(type: MessageType) {
    if (type === "success") {
        return theme.colors.success;
    }

    if (type === "error") {
        return theme.colors.error;
    }

    return theme.colors.info;
}

function getToastIcon(type: MessageType) {
    if (type === "success") {
        return "checkmark-circle";
    }

    if (type === "error") {
        return "alert-circle";
    }

    return "information-circle";
}

function ToastCard({
    id,
    title,
    message,
    type,
}: {
    id: string;
    title: string;
    message: string;
    type: MessageType;
}) {
    const { dismissToast } = useAppState();
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(-12)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 220,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 220,
                useNativeDriver: true,
            }),
        ]).start();
    }, [opacity, translateY]);

    return (
        <Animated.View
            style={[
                styles.toastCard,
                {
                    borderLeftColor: getToastAccent(type),
                    opacity,
                    transform: [{ translateY }],
                },
            ]}
        >
            <View style={styles.toastIconWrap}>
                <Ionicons
                    name={getToastIcon(type)}
                    size={20}
                    color={getToastAccent(type)}
                />
            </View>
            <View style={styles.toastBody}>
                <Text style={styles.toastTitle}>{title}</Text>
                <Text style={styles.toastMessage}>{message}</Text>
            </View>
            <Pressable
                onPress={() => dismissToast(id)}
                style={styles.toastClose}
                accessibilityLabel="Zamknij powiadomienie"
            >
                <Ionicons
                    name="close"
                    size={18}
                    color={theme.colors.textMuted}
                />
            </Pressable>
        </Animated.View>
    );
}

export default function ToastHost() {
    const { toasts } = useAppState();

    if (toasts.length === 0) {
        return null;
    }

    return (
        <View pointerEvents="box-none" style={styles.container}>
            {toasts.map((toast) => (
                <ToastCard key={toast.id} {...toast} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: Platform.select({ web: 20, default: 56 }),
        right: theme.spacing.md,
        left: theme.spacing.md,
        zIndex: 1000,
        gap: theme.spacing.sm,
        alignItems: "center",
    },
    toastCard: {
        width: "100%",
        maxWidth: 460,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        borderLeftWidth: 4,
        paddingVertical: 12,
        paddingHorizontal: 14,
        ...theme.shadows.lg,
    },
    toastIconWrap: {
        marginRight: theme.spacing.sm,
    },
    toastBody: {
        flex: 1,
        gap: 2,
    },
    toastTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: theme.colors.text,
    },
    toastMessage: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        lineHeight: 18,
    },
    toastClose: {
        marginLeft: theme.spacing.sm,
        padding: 4,
    },
});
