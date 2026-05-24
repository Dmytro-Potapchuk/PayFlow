import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { ActivityIndicator, TouchableOpacity } from "react-native";

import { theme } from "@/constants/theme";

import AppButton from "@/components/AppButton";
import AppInput from "@/components/AppInput";

describe("AppButton", () => {
  it("renderuje tekst i wywołuje onPress", () => {
    const onPress = jest.fn();
    const { getByText } = render(<AppButton title="Zapisz" onPress={onPress} />);

    fireEvent.press(getByText("Zapisz"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("blokuje kliknięcie i pokazuje loading", () => {
    const onPress = jest.fn();
    const { queryByText, UNSAFE_getByType } = render(
      <AppButton title="Usuń" onPress={onPress} loading variant="danger" />
    );

    expect(queryByText("Usuń")).toBeNull();
    expect(UNSAFE_getByType(TouchableOpacity).props.disabled).toBe(true);
    expect(UNSAFE_getByType(ActivityIndicator).props.color).toBe("#ffffff");
  });

  it("używa koloru primary dla loadera w wariancie outline", () => {
    const { UNSAFE_getByType } = render(
      <AppButton title="Dalej" onPress={jest.fn()} loading variant="outline" />
    );

    expect(UNSAFE_getByType(ActivityIndicator).props.color).toBe(
      theme.colors.primary
    );
  });
});

describe("AppInput", () => {
  it("renderuje label i error", () => {
    const { getByText, getByPlaceholderText } = render(
      <AppInput
        label="Login"
        error="Pole jest wymagane"
        placeholder="Wpisz login"
      />
    );

    expect(getByText("Login")).toBeTruthy();
    expect(getByText("Pole jest wymagane")).toBeTruthy();
    expect(getByPlaceholderText("Wpisz login")).toBeTruthy();
  });

  it("przełącza widoczność hasła", () => {
    const { getByPlaceholderText, getByLabelText } = render(
      <AppInput placeholder="Hasło" isPassword secureTextEntry />
    );

    const input = getByPlaceholderText("Hasło");
    expect(input.props.secureTextEntry).toBe(true);

    fireEvent.press(getByLabelText("Pokaż hasło"));
    expect(getByPlaceholderText("Hasło").props.secureTextEntry).toBe(false);

    fireEvent.press(getByLabelText("Ukryj hasło"));
    expect(getByPlaceholderText("Hasło").props.secureTextEntry).toBe(true);
  });
});
