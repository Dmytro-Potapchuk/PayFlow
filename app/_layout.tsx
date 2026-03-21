import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet, Platform } from "react-native";
import ToastHost from "@/components/ToastHost";
import KeyboardDismissView from "@/components/KeyboardDismissView";
import { AppProvider } from "@/providers/AppProvider";

export default function RootLayout() {
    const content = (
        <AppProvider>
            <StatusBar style="dark" />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: "#f5f7fa" },
                }}
            />
            <ToastHost />
        </AppProvider>
    );

    if (Platform.OS === "web") {
        return <View style={styles.root}>{content}</View>;
    }

    return (
        <KeyboardDismissView style={styles.root}>
            {content}
        </KeyboardDismissView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
});