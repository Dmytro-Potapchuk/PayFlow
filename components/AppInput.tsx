import { TextInput, Text, View, StyleSheet, TextInputProps } from "react-native";
import { theme } from "@/constants/theme";

type Props = TextInputProps & {
    label?: string;
    error?: string;
};

export default function AppInput({ label, error, style, ...props }: Props) {
    return (
        <View style={styles.wrapper}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[styles.input, error && styles.inputError, style]}
                placeholderTextColor={theme.colors.textMuted}
                {...props}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: { marginBottom: theme.spacing.md },
    label: {
        fontSize: 14,
        fontWeight: "500",
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
    },
    input: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.md,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: theme.colors.text,
    },
    inputError: {
        borderColor: theme.colors.error,
    },
    errorText: {
        fontSize: 12,
        color: theme.colors.error,
        marginTop: theme.spacing.xs,
    },
});
