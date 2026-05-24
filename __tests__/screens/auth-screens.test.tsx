import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { Platform } from "react-native";

jest.mock("@/api/auth.api", () => ({
  login: jest.fn(),
  register: jest.fn(),
}));

jest.mock("@/providers/AppProvider", () => ({
  useSession: jest.fn(),
  useToast: jest.fn(),
}));

jest.mock("@/components/IosHomeScreenNotice", () => () => null);

import { router } from "expo-router";

import { ApiError } from "@/api/errors";
import { login, register } from "@/api/auth.api";
import { useSession, useToast } from "@/providers/AppProvider";
import LoginScreen from "@/app/auth/login";
import RegisterScreen from "@/app/auth/register";

const loginMock = login as jest.Mock;
const registerMock = register as jest.Mock;
const useSessionMock = useSession as jest.Mock;
const useToastMock = useToast as jest.Mock;
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
    useSessionMock.mockReturnValue({
      authenticate,
    });
    useToastMock.mockReturnValue({
      showToast,
    });
  });

  it("odrzuca login składający się tylko ze spacji", async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText("Login"), "   ");
    fireEvent.changeText(getByPlaceholderText("Hasło"), "secret");
    fireEvent.press(getByText("Zaloguj się"));

    expect(showToast).toHaveBeenCalledWith(
      "Błąd",
      "Wprowadź login i hasło",
      "error"
    );
    expect(loginMock).not.toHaveBeenCalled();
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
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("loguje użytkownika i przekierowuje do zakładek", async () => {
    loginMock.mockResolvedValue({ access_token: "token-1" });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText("Login"), "demo");
    fireEvent.changeText(getByPlaceholderText("Hasło"), "secret");
    fireEvent.press(getByText("Zaloguj się"));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith("demo", "secret");
      expect(authenticate).toHaveBeenCalledWith("token-1");
      expect(showToast).toHaveBeenCalledWith(
        "Sukces",
        "Logowanie poprawne",
        "success"
      );
      expect(router.replace).toHaveBeenCalledWith("/(tabs)");
    });
  });

  it("mapuje 401 na przyjazny komunikat", async () => {
    loginMock.mockRejectedValue(
      new ApiError("Unauthorized", { status: 401, code: "HTTP_ERROR" })
    );

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText("Login"), "demo");
    fireEvent.changeText(getByPlaceholderText("Hasło"), "secret");
    fireEvent.press(getByText("Zaloguj się"));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        "Błąd",
        "Nieprawidłowy login lub hasło",
        "error"
      );
    });
  });

  it("pokazuje surowy komunikat błędu logowania, gdy nie jest to unauthorized", async () => {
    loginMock.mockRejectedValue({ message: "Serwer chwilowo niedostępny" });

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
    registerMock.mockResolvedValue({ ok: true });

    const { getByPlaceholderText, getByText } = render(<RegisterScreen />);

    fireEvent.changeText(getByPlaceholderText("Login"), "demo");
    fireEvent.changeText(getByPlaceholderText("Email"), "demo@example.com");
    fireEvent.changeText(
      getByPlaceholderText("Hasło (min. 6 znaków, litera i cyfra)"),
      "secret123"
    );
    fireEvent.press(getByText("Zarejestruj się"));

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith(
        "demo",
        "demo@example.com",
        "secret123"
      );
      expect(showToast).toHaveBeenCalledWith(
        "Sukces",
        "Konto utworzone",
        "success"
      );
      expect(router.replace).toHaveBeenCalledWith("/auth/login");
    });
  });

  it("waliduje puste pola rejestracji bez wywołania API", async () => {
    const { getByText } = render(<RegisterScreen />);

    fireEvent.press(getByText("Zarejestruj się"));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        "Błąd",
        "Wypełnij wszystkie pola",
        "error"
      );
    });
    expect(registerMock).not.toHaveBeenCalled();
  });

  it("blokuje wielokrotne kliknięcia podczas rejestracji", async () => {
    let resolveRegister: (value: { ok: boolean }) => void = () => undefined;
    registerMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRegister = resolve;
        })
    );

    const { getByPlaceholderText, getByText } = render(<RegisterScreen />);

    fireEvent.changeText(getByPlaceholderText("Login"), "demo");
    fireEvent.changeText(getByPlaceholderText("Email"), "demo@example.com");
    fireEvent.changeText(
      getByPlaceholderText("Hasło (min. 6 znaków, litera i cyfra)"),
      "secret123"
    );

    const submitButton = getByText("Zarejestruj się");
    fireEvent.press(submitButton);
    fireEvent.press(submitButton);

    expect(registerMock).toHaveBeenCalledTimes(1);

    resolveRegister({ ok: true });

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith("/auth/login");
    });
  });

  it("pokazuje błąd rejestracji i obsługuje powrót", async () => {
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: "android",
    });
    registerMock.mockRejectedValue({ error: "Email już istnieje" });

    const { getByPlaceholderText, getByText } = render(<RegisterScreen />);

    fireEvent.changeText(getByPlaceholderText("Login"), "demo");
    fireEvent.changeText(getByPlaceholderText("Email"), "demo@example.com");
    fireEvent.changeText(
      getByPlaceholderText("Hasło (min. 6 znaków, litera i cyfra)"),
      "secret123"
    );
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
