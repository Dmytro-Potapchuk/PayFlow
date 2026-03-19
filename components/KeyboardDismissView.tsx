import {
    Pressable,
    Keyboard,
    StyleSheet,
    ViewStyle,
} from "react-native";

type Props = {
    children: React.ReactNode;
    style?: ViewStyle;
};

/**
 * Opakowuje zawartość ekranu. Tapnięcie w pusty obszar (poza inputem)
 * zamyka klawiaturę. Tapnięcie w input nadal otwiera klawiaturę.
 */
export default function KeyboardDismissView({ children, style }: Props) {
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
