import {
    Pressable,
    Text,
    TextInput,
    View,
    StyleSheet,
    TextInputProps,
} from "react-native";
import { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import { theme } from "@/constants/theme";

type Props = TextInputProps & {
    label?: string;
    error?: string;
    isPassword?: boolean;
};

export default function AppInput({
    label,
    error,
    style,
    isPassword = false,
    secureTextEntry,
    ...props
}: Props) {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const shouldHideText = useMemo(
        () => Boolean(isPassword || secureTextEntry) && !isPasswordVisible,
        [isPassword, isPasswordVisible, secureTextEntry]
    );

    return (
        <View style={styles.wrapper} pointerEvents="box-none">
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={styles.inputWrap}>
                <TextInput
                    style={[
                        styles.input,
                        Boolean(isPassword || secureTextEntry) && styles.inputWithIcon,
                        error && styles.inputError,
                        style,
                    ]}
                    placeholderTextColor={theme.colors.textMuted}
                    secureTextEntry={shouldHideText}
                    {...props}
                />
                {Boolean(isPassword || secureTextEntry) && (
                    <Pressable
                        onPress={() => setIsPasswordVisible((current) => !current)}
                        style={styles.iconButton}
                        accessibilityRole="button"
                        accessibilityLabel={
                            isPasswordVisible ? "Ukryj hasło" : "Pokaż hasło"
                        }
                    >
                        <Ionicons
                            name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                            size={20}
                            color={theme.colors.textMuted}
                        />
                    </Pressable>
                )}
            </View>
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
    inputWrap: {
        position: "relative",
        justifyContent: "center",
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
    inputWithIcon: {
        paddingRight: 48,
    },
    inputError: {
        borderColor: theme.colors.error,
    },
    iconButton: {
        position: "absolute",
        right: 14,
        padding: 2,
    },
    errorText: {
        fontSize: 12,
        color: theme.colors.error,
        marginTop: theme.spacing.xs,
    },
});
