import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";

import { login as loginRequest } from "@/api/auth.api";
import { AUTH_FIELD_LIMITS } from "@/constants/authLimits";
import { useIsMounted } from "@/hooks/useIsMounted";
import AppButton from "@/components/AppButton";
import AppInput from "@/components/AppInput";
import IosHomeScreenNotice from "@/components/IosHomeScreenNotice";
import { theme } from "@/constants/theme";
import { useSession, useToast } from "@/providers/AppProvider";
import { validateLoginForm } from "@/utils/authFormValidation";
import {
    getErrorMessage,
    isUnauthorizedError,
} from "@/utils/errorMessage";
import { logError } from "@/utils/logError";

export default function LoginScreen() {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const isMountedRef = useIsMounted();
    const { authenticate } = useSession();
    const { showToast } = useToast();

    const handleLogin = async () => {
        const validationError = validateLoginForm(login, password);
        if (validationError) {
            showToast("Błąd", validationError, "error");
            return;
        }

        try {
            setLoading(true);
            const data = await loginRequest(login.trim(), password);
            await authenticate(data.access_token);

            if (!isMountedRef.current) {
                return;
            }

            showToast("Sukces", "Logowanie poprawne", "success");
            router.replace("/(tabs)");
        } catch (error: unknown) {
            logError("auth.login", error);

            if (!isMountedRef.current) {
                return;
            }

            const message = isUnauthorizedError(error)
                ? "Nieprawidłowy login lub hasło"
                : getErrorMessage(error, "Nie udało się zalogować");

            showToast("Błąd", message, "error");
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
                <View style={styles.container}>
                    <View style={styles.brand}>
                        <Text style={styles.logo}>PayFlow Demo</Text>
                        <Text style={styles.tagline}>Wersja testowa / sandbox</Text>
                    </View>

                    <View style={styles.notice}>
                        <Text style={styles.noticeTitle}>Aplikacja testowa</Text>
                        <Text style={styles.noticeText}>
                            To demo nie jest prawdziwą aplikacją bankową ani płatniczą.
                            Nie służy do realnych płatności ani przechowywania środków.
                        </Text>
                    </View>

                    <IosHomeScreenNotice />

                    <View style={styles.form}>
                        <AppInput
                            placeholder="Login"
                            value={login}
                            onChangeText={setLogin}
                            autoCapitalize="none"
                            maxLength={AUTH_FIELD_LIMITS.login.max}
                        />
                        <AppInput
                            placeholder="Hasło"
                            secureTextEntry
                            isPassword
                            value={password}
                            onChangeText={setPassword}
                            maxLength={AUTH_FIELD_LIMITS.password.max}
                        />
                        <AppButton
                            title={loading ? "Logowanie..." : "Zaloguj się"}
                            onPress={handleLogin}
                            loading={loading}
                            disabled={loading}
                            style={styles.primaryBtn}
                        />
                        <AppButton
                            title="Nie masz konta? Zarejestruj się"
                            onPress={() => router.push("/auth/register")}
                            variant="outline"
                            disabled={loading}
                        />
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    flex: { flex: 1 },
    container: {
        flex: 1,
        justifyContent: "center",
        padding: theme.spacing.lg,
    },
    brand: {
        alignItems: "center",
        marginBottom: theme.spacing.lg,
    },
    logo: {
        fontSize: 36,
        fontWeight: "700",
        color: theme.colors.primary,
        letterSpacing: 1,
    },
    tagline: {
        fontSize: 16,
        color: theme.colors.textMuted,
        marginTop: 8,
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
