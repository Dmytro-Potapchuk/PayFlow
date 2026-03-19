import { Platform } from "react-native";

/**
 * Na web: "always" - ScrollView nie przechwytuje kliknięć, inputy działają.
 * Na native: "never" - tap poza inputem zamyka klawiaturę.
 */
export const keyboardShouldPersistTaps: "always" | "never" | "handled" =
    Platform.OS === "web" ? "always" : "never";
