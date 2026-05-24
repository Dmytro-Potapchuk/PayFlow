import {
  getPasswordValidationError,
  isPasswordStrongEnough,
} from "@/utils/passwordValidation";

describe("passwordValidation", () => {
  it("odrzuca hasło z samych spacji", () => {
    expect(getPasswordValidationError("      ")).toBe(
      "Hasło nie może być puste"
    );
  });

  it("wymaga litery i cyfry", () => {
    expect(isPasswordStrongEnough("abcdef")).toBe(false);
    expect(isPasswordStrongEnough("123456")).toBe(false);
    expect(isPasswordStrongEnough("abc123")).toBe(true);
  });
});
