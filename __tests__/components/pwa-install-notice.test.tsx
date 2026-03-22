import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { Platform } from "react-native";

import PwaInstallNotice from "@/components/PwaInstallNotice";

describe("PwaInstallNotice", () => {
  const originalWindow = global.window;
  const originalPlatform = Platform.OS;

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

    const { queryByText } = render(<PwaInstallNotice />);
    expect(queryByText("Zainstaluj na iPhone")).toBeNull();
  });

  it("renderuje wskazówkę dla Safari na iOS i pozwala ją zamknąć", () => {
    global.window = {
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

    const { getByText, queryByText } = render(<PwaInstallNotice compact />);

    expect(getByText("Zainstaluj na iPhone")).toBeTruthy();
    fireEvent.press(getByText("close"));
    expect(queryByText("Zainstaluj na iPhone")).toBeNull();
  });
});
