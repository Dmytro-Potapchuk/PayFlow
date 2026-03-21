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

import { apiRequest } from "@/api/api";
import { getErrorMessage } from "@/utils/errorMessage";
import AppButton from "@/components/AppButton";
import AppInput from "@/components/AppInput";
import { theme } from "@/constants/theme";
import { useAppState } from "@/providers/AppProvider";

export default function LoginScreen() {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { authenticate, showToast } = useAppState();

    const handleLogin = async () => {
        if (!login || !password) {
            showToast("Błąd", "Wprowadź login i hasło", "error");
            return;
        }

        try {
            setLoading(true);
            const data = await apiRequest<{ access_token: string }>(
                "/auth/login",
                "POST",
                { login, password }
            );
            await authenticate(data.access_token);
            showToast("Sukces", "Logowanie poprawne", "success");
            router.replace("/(tabs)");
        } catch (error: unknown) {
            const message = getErrorMessage(error, "Nie udało się zalogować");
            showToast(
                "Błąd",
                message.toLowerCase().includes("unauthorized")
                    ? "Nieprawidłowy login lub email"
                    : message,
                "error"
            );
        } finally {
            setLoading(false);
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
                        <Text style={styles.logo}>PayFlow</Text>
                        <Text style={styles.tagline}>Bankowość mobilna</Text>
                    </View>

                    <View style={styles.form}>
                        <AppInput
                            placeholder="Login"
                            value={login}
                            onChangeText={setLogin}
                            autoCapitalize="none"
                        />
                        <AppInput
                            placeholder="Hasło"
                            secureTextEntry
                            isPassword
                            value={password}
                            onChangeText={setPassword}
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
        marginBottom: theme.spacing.xl,
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
    form: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        ...theme.shadows.md,
    },
    primaryBtn: { marginBottom: theme.spacing.md },
});
