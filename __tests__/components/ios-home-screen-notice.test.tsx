import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { Platform } from "react-native";

import IosHomeScreenNotice from "@/components/IosHomeScreenNotice";

const DISMISS_STORAGE_KEY = "payflow-ios-homescreen-notice-dismissed";

describe("IosHomeScreenNotice", () => {
  const originalWindow = global.window;
  const originalPlatform = Platform.OS;
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();
    global.window = {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          storage.set(key, value);
        },
        removeItem: (key: string) => {
          storage.delete(key);
        },
      },
      navigator: {
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit Safari/604.1",
        standalone: false,
      },
    } as Window & typeof globalThis;

    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: "web",
    });
  });

  afterEach(() => {
    global.window = originalWindow;
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: originalPlatform,
    });
  });

  it("nie renderuje się poza web", () => {
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: "android",
    });

    const { queryByText } = render(<IosHomeScreenNotice />);
    expect(queryByText("Zainstaluj na iPhone")).toBeNull();
  });

  it("renderuje wskazówkę dla Safari na iOS i pozwala ją zamknąć", () => {
    const { getByText, queryByText } = render(<IosHomeScreenNotice compact />);

    expect(getByText("Zainstaluj na iPhone")).toBeTruthy();
    fireEvent.press(getByText("close"));
    expect(queryByText("Zainstaluj na iPhone")).toBeNull();
    expect(storage.get(DISMISS_STORAGE_KEY)).toBe("1");
  });

  it("pamięta zamknięcie banera po ponownym renderze", () => {
    storage.set(DISMISS_STORAGE_KEY, "1");

    const { queryByText } = render(<IosHomeScreenNotice />);
    expect(queryByText("Zainstaluj na iPhone")).toBeNull();
  });
});
