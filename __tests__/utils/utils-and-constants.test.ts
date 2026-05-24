import { collectApiOrigins } from "@/constants/apiConfig";
import { getErrorMessage } from "@/utils/errorMessage";
import { formatTimestamp } from "@/utils/formatTimestamp";
import { confirmAction } from "@/utils/confirmAction";
import { Alert, Platform } from "react-native";

describe("collectApiOrigins", () => {
  it("zawiera domyślne originy dev i produkcji dla CSP", () => {
    const origins = collectApiOrigins();

    expect(origins).toContain("http://localhost:3000");
    expect(origins).toContain("https://api.payflow.waw.pl");
  });
});

describe("getErrorMessage", () => {
  it("czyta wiadomość z instancji Error", () => {
    expect(getErrorMessage(new Error("Boom"), "Fallback")).toBe("Boom");
  });

  it("czyta pola message i error z obiektu", () => {
    expect(getErrorMessage({ message: "Z pola message" }, "Fallback")).toBe(
      "Z pola message"
    );
    expect(getErrorMessage({ error: "Z pola error" }, "Fallback")).toBe(
      "Z pola error"
    );
  });

  it("używa fallback gdy format błędu jest nieznany", () => {
    expect(getErrorMessage({ message: 123 }, "Fallback")).toBe("Fallback");
    expect(getErrorMessage({ error: 123 }, "Fallback")).toBe("Fallback");
    expect(getErrorMessage("tekst", "Fallback")).toBe("Fallback");
    expect(getErrorMessage(null, "Fallback")).toBe("Fallback");
  });
});

describe("keyboardShouldPersistTaps", () => {
  afterEach(() => {
    jest.resetModules();
    jest.dontMock("react-native");
  });

  it("zwraca always dla web", () => {
    jest.doMock("react-native", () => ({
      Platform: { OS: "web" },
    }));

    jest.isolateModules(() => {
      const { keyboardShouldPersistTaps } = require("@/constants/keyboard");
      expect(keyboardShouldPersistTaps).toBe("always");
    });
  });

  it("zwraca never dla natywnych platform", () => {
    jest.doMock("react-native", () => ({
      Platform: { OS: "android" },
    }));

    jest.isolateModules(() => {
      const { keyboardShouldPersistTaps } = require("@/constants/keyboard");
      expect(keyboardShouldPersistTaps).toBe("never");
    });
  });
});

describe("formatTimestamp", () => {
  it("zwraca pusty string bez daty", () => {
    expect(formatTimestamp()).toBe("");
  });

  it("formatuje godzinę i opcjonalnie datę", () => {
  const date = "2026-05-24T14:30:00.000Z";
  expect(formatTimestamp(date)).toMatch(/\d{2}:\d{2}/);
  expect(formatTimestamp(date, { includeDate: true })).toMatch(/\d{2}\.\d{2}/);
  });
});

describe("confirmAction", () => {
  const originalPlatform = Platform.OS;
  const originalWindow = global.window;

  afterEach(() => {
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: originalPlatform,
    });
    global.window = originalWindow;
    jest.restoreAllMocks();
  });

  it("używa window.confirm na web", async () => {
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: "web",
    });
    global.window = {
      confirm: jest.fn().mockReturnValue(true),
    } as Window & typeof globalThis;

    await expect(
      confirmAction({
        title: "Usuń",
        message: "Na pewno?",
      })
    ).resolves.toBe(true);

    expect(global.window.confirm).toHaveBeenCalledWith("Usuń\n\nNa pewno?");
  });

  it("używa Alert.alert na platformach natywnych", async () => {
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: "android",
    });

    const alertSpy = jest
      .spyOn(Alert, "alert")
      .mockImplementation((_title, _message, buttons) => {
        buttons?.[1]?.onPress?.();
      });

    await expect(
      confirmAction({
        title: "Usuń",
        message: "Na pewno?",
        confirmLabel: "Usuń",
      })
    ).resolves.toBe(true);

    expect(alertSpy).toHaveBeenCalled();
  });
});
