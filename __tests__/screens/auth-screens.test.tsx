import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { Platform } from "react-native";

jest.mock("@/api/api", () => ({
  apiRequest: jest.fn(),
}));

jest.mock("@/providers/AppProvider", () => ({
  useAppState: jest.fn(),
}));

jest.mock("@/components/PwaInstallNotice", () => () => null);

import { router } from "expo-router";

import { apiRequest } from "@/api/api";
import { useAppState } from "@/providers/AppProvider";
import LoginScreen from "@/app/auth/login";
import RegisterScreen from "@/app/auth/register";

const apiRequestMock = apiRequest as jest.Mock;
const useAppStateMock = useAppState as jest.Mock;
const authenticate = jest.fn();
const showToast = jest.fn();

describe("auth screens", () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: originalPlatform,
    });
    useAppStateMock.mockReturnValue({
      authenticate,
      showToast,
    });
  });

  it("waliduje puste pola logowania", async () => {
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: "android",
    });
    const { getByText } = render(<LoginScreen />);

    fireEvent.press(getByText("Zaloguj się"));

    expect(showToast).toHaveBeenCalledWith(
      "Błąd",
      "Wprowadź login i hasło",
      "error"
    );
    expect(apiRequestMock).not.toHaveBeenCalled();
  });

  it("loguje użytkownika i przekierowuje do zakładek", async () => {
    apiRequestMock.mockResolvedValue({ access_token: "token-1" });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText("Login"), "demo");
    fireEvent.changeText(getByPlaceholderText("Hasło"), "secret");
    fireEvent.press(getByText("Zaloguj się"));

    await waitFor(() => {
      expect(apiRequestMock).toHaveBeenCalledWith("/auth/login", "POST", {
        login: "demo",
        password: "secret",
      });
      expect(authenticate).toHaveBeenCalledWith("token-1");
      expect(showToast).toHaveBeenCalledWith(
        "Sukces",
        "Logowanie poprawne",
        "success"
      );
      expect(router.replace).toHaveBeenCalledWith("/(tabs)");
    });
  });

  it("mapuje unauthorized na przyjazny komunikat", async () => {
    apiRequestMock.mockRejectedValue({ message: "Unauthorized user" });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText("Login"), "demo");
    fireEvent.changeText(getByPlaceholderText("Hasło"), "secret");
    fireEvent.press(getByText("Zaloguj się"));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        "Błąd",
        "Nieprawidłowy login lub email",
        "error"
      );
    });
  });

  it("pokazuje surowy komunikat błędu logowania, gdy nie jest to unauthorized", async () => {
    apiRequestMock.mockRejectedValue({ message: "Serwer chwilowo niedostępny" });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText("Login"), "demo");
    fireEvent.changeText(getByPlaceholderText("Hasło"), "secret");
    fireEvent.press(getByText("Zaloguj się"));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        "Błąd",
        "Serwer chwilowo niedostępny",
        "error"
      );
    });
  });

  it("przechodzi do rejestracji z ekranu logowania", () => {
    const { getByText } = render(<LoginScreen />);

    fireEvent.press(getByText("Nie masz konta? Zarejestruj się"));
    expect(router.push).toHaveBeenCalledWith("/auth/register");
  });

  it("rejestruje konto i wraca do logowania", async () => {
    apiRequestMock.mockResolvedValue({ ok: true });

    const { getByPlaceholderText, getByText } = render(<RegisterScreen />);

    fireEvent.changeText(getByPlaceholderText("Login"), "demo");
    fireEvent.changeText(getByPlaceholderText("Email"), "demo@example.com");
    fireEvent.changeText(
      getByPlaceholderText("Hasło (min. 6 znaków)"),
      "secret123"
    );
    fireEvent.press(getByText("Zarejestruj się"));

    await waitFor(() => {
      expect(apiRequestMock).toHaveBeenCalledWith("/auth/register", "POST", {
        login: "demo",
        email: "demo@example.com",
        password: "secret123",
      });
      expect(showToast).toHaveBeenCalledWith(
        "Sukces",
        "Konto utworzone",
        "success"
      );
      expect(router.replace).toHaveBeenCalledWith("/auth/login");
    });
  });

  it("pokazuje błąd rejestracji i obsługuje powrót", async () => {
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: "android",
    });
    apiRequestMock.mockRejectedValue({ error: "Email już istnieje" });

    const { getByText } = render(<RegisterScreen />);

    fireEvent.press(getByText("Zarejestruj się"));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        "Błąd",
        "Email już istnieje",
        "error"
      );
    });

    fireEvent.press(getByText("Masz konto? Zaloguj się"));
    expect(router.back).toHaveBeenCalled();
  });
});
