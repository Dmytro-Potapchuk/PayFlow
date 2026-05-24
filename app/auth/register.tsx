import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";

import { register as registerRequest } from "@/api/auth.api";
import { AUTH_FIELD_LIMITS } from "@/constants/authLimits";
import { useIsMounted } from "@/hooks/useIsMounted";
import AppButton from "@/components/AppButton";
import AppInput from "@/components/AppInput";
import { theme } from "@/constants/theme";
import { keyboardShouldPersistTaps } from "@/constants/keyboard";
import { useToast } from "@/providers/AppProvider";
import { validateRegisterForm } from "@/utils/authFormValidation";
import { getErrorMessage } from "@/utils/errorMessage";
import { logError } from "@/utils/logError";

export default function RegisterScreen() {
    const [login, setLogin] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const isMountedRef = useIsMounted();
    const { showToast } = useToast();

    const handleRegister = async () => {
        const validationError = validateRegisterForm(login, email, password);
        if (validationError) {
            showToast("Błąd", validationError, "error");
            return;
        }

        try {
            setLoading(true);
            await registerRequest(login.trim(), email.trim(), password);

            if (!isMountedRef.current) {
                return;
            }

            showToast("Sukces", "Konto utworzone", "success");
            router.replace("/auth/login");
        } catch (error: unknown) {
            logError("auth.register", error);

            if (!isMountedRef.current) {
                return;
            }

            showToast(
                "Błąd",
                getErrorMessage(error, "Nie udało się zarejestrować"),
                "error"
            );
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps={keyboardShouldPersistTaps}
                    keyboardDismissMode="on-drag"
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Rejestracja</Text>
                        <Text style={styles.subtitle}>
                            Utwórz konto w PayFlow Demo
                        </Text>
                    </View>

                    <View style={styles.notice}>
                        <Text style={styles.noticeTitle}>Wersja testowa</Text>
                        <Text style={styles.noticeText}>
                            Konto tworzone jest tylko do celów demonstracyjnych. Aplikacja
                            nie jest prawdziwym systemem bankowym ani płatniczym.
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <AppInput
                            placeholder="Login"
                            value={login}
                            onChangeText={setLogin}
                            autoCapitalize="none"
                            maxLength={AUTH_FIELD_LIMITS.login.max}
                            editable={!loading}
                        />
                        <AppInput
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            maxLength={AUTH_FIELD_LIMITS.email.max}
                            editable={!loading}
                        />
                        <AppInput
                            placeholder="Hasło (min. 6 znaków, litera i cyfra)"
                            secureTextEntry
                            isPassword
                            value={password}
                            onChangeText={setPassword}
                            maxLength={AUTH_FIELD_LIMITS.password.max}
                            editable={!loading}
                        />
                        <AppButton
                            title={loading ? "Rejestrowanie..." : "Zarejestruj się"}
                            onPress={handleRegister}
                            loading={loading}
                            disabled={loading}
                            style={styles.primaryBtn}
                        />
                        <AppButton
                            title="Masz konto? Zaloguj się"
                            onPress={() => router.back()}
                            variant="outline"
                            disabled={loading}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    flex: { flex: 1 },
    scroll: {
        flexGrow: 1,
        padding: theme.spacing.lg,
        paddingTop: theme.spacing.xl,
    },
    header: { marginBottom: theme.spacing.lg },
    title: {
        ...theme.typography.h1,
        color: theme.colors.text,
    },
    subtitle: {
        ...theme.typography.bodySmall,
        color: theme.colors.textMuted,
        marginTop: 4,
    },
    notice: {
        backgroundColor: theme.colors.noticeBackground,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.noticeBorder,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.lg,
    },
    noticeTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: theme.colors.warning,
        marginBottom: 4,
    },
    noticeText: {
        fontSize: 13,
        lineHeight: 18,
        color: theme.colors.noticeText,
    },
    form: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        ...theme.shadows.md,
    },
    primaryBtn: { marginBottom: theme.spacing.md },
});
