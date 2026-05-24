import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

function getWebStorage(): Storage | null {
    if (Platform.OS !== "web" || typeof window === "undefined") {
        return null;
    }

    try {
        return window.sessionStorage;
    } catch {
        return null;
    }
}

export async function setSecureItem(
    key: string,
    value: string
): Promise<void> {
    if (Platform.OS === "web") {
        const webStorage = getWebStorage();
        if (webStorage) {
            webStorage.setItem(key, value);
            return;
        }

        await AsyncStorage.setItem(key, value);
        return;
    }

    await SecureStore.setItemAsync(key, value);
}

export async function getSecureItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
        const webStorage = getWebStorage();
        if (webStorage) {
            return webStorage.getItem(key);
        }

        return AsyncStorage.getItem(key);
    }

    return SecureStore.getItemAsync(key);
}

export async function removeSecureItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
        const webStorage = getWebStorage();
        if (webStorage) {
            webStorage.removeItem(key);
            return;
        }

        await AsyncStorage.removeItem(key);
        return;
    }

    await SecureStore.deleteItemAsync(key);
}
