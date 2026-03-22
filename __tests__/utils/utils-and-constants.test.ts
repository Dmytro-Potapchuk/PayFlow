import { getErrorMessage } from "@/utils/errorMessage";

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
