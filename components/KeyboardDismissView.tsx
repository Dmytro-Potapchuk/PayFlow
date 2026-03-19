import {
    Pressable,
    View,
    Keyboard,
    StyleSheet,
    ViewStyle,
    Platform,
} from "react-native";

type Props = {
    children: React.ReactNode;
    style?: ViewStyle;
};

/**
 * Opakowuje zawartość ekranu. Na iOS/Android: tapnięcie w pusty obszar
 * zamyka klawiaturę. Na web: zwykły View (Pressable blokuje fokus inputów).
 */
export default function KeyboardDismissView({ children, style }: Props) {
    if (Platform.OS === "web") {
        return <View style={[styles.wrapper, style]}>{children}</View>;
    }

    return (
        <Pressable
            style={[styles.wrapper, style]}
            onPress={Keyboard.dismiss}
        >
            {children}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
    },
});
