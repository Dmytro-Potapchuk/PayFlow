import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from "react-native";
import { theme } from "@/constants/theme";

type Variant = "primary" | "secondary" | "outline" | "danger";

type Props = {
    title: string;
    onPress: () => void;
    variant?: Variant;
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
};

export default function AppButton({
    title,
    onPress,
    variant = "primary",
    disabled = false,
    loading = false,
    style,
    textStyle,
}: Props) {
    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            style={[
                styles.base,
                styles[variant],
                isDisabled && styles.disabled,
                style,
            ]}
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={variant === "primary" || variant === "danger" ? "#fff" : theme.colors.primary}
                />
            ) : (
                <Text style={[styles.text, styles[`text_${variant}`], textStyle]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 48,
    },
    primary: {
        backgroundColor: theme.colors.primary,
        ...theme.shadows.sm,
    },
    secondary: {
        backgroundColor: theme.colors.accent,
    },
    outline: {
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    danger: {
        backgroundColor: theme.colors.error,
    },
    disabled: {
        opacity: 0.6,
    },
    text: {
        fontSize: 16,
        fontWeight: "600",
    },
    text_primary: { color: "#fff" },
    text_secondary: { color: "#fff" },
    text_outline: { color: theme.colors.primary },
    text_danger: { color: "#fff" },
});
