import {
    View,
    Text,
    StyleSheet,
    Alert,
    ScrollView,
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

export default function RegisterScreen() {
    const [login, setLogin] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async () => {
        try {
            await apiRequest("/auth/register", "POST", {
                login,
                email,
                password,
            });
            Alert.alert("Sukces", "Konto utworzone");
            router.replace("/auth/login");
        } catch (error: unknown) {
            Alert.alert(
                "Błąd",
                getErrorMessage(error, "Nie udało się zarejestrować")
            );
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
                    keyboardShouldPersistTaps="never"
                    keyboardDismissMode="on-drag"
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Rejestracja</Text>
                        <Text style={styles.subtitle}>
                            Utwórz konto w PayFlow
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <AppInput
                            placeholder="Login"
                            value={login}
                            onChangeText={setLogin}
                            autoCapitalize="none"
                        />
                        <AppInput
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <AppInput
                            placeholder="Hasło (min. 6 znaków)"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                        <AppButton
                            title="Zarejestruj się"
                            onPress={handleRegister}
                            style={styles.primaryBtn}
                        />
                        <AppButton
                            title="Masz konto? Zaloguj się"
                            onPress={() => router.back()}
                            variant="outline"
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
    form: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        ...theme.shadows.md,
    },
    primaryBtn: { marginBottom: theme.spacing.md },
});
