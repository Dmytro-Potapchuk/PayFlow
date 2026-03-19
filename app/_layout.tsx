import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import KeyboardDismissView from "@/components/KeyboardDismissView";

export default function RootLayout() {
    return (
        <KeyboardDismissView style={styles.root}>
            <StatusBar style="dark" />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: "#f5f7fa" },
                }}
            />
        </KeyboardDismissView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
});