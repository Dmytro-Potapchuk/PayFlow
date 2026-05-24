import { ValidationError } from "@/api/errors";
import {
  assertCurrencyCode,
  assertEmail,
  assertMinLength,
  assertNonEmptyString,
  assertPasswordStrength,
  assertUserRole,
} from "@/api/validation";

describe("validation", () => {
  it("wymaga niepustych stringów", () => {
    expect(() => assertNonEmptyString("", "Login")).toThrow(ValidationError);
    expect(() => assertNonEmptyString("   ", "Login")).toThrow(ValidationError);
    expect(() => assertNonEmptyString("demo", "Login")).not.toThrow();
  });

  it("waliduje email", () => {
    expect(() => assertEmail("niepoprawny")).toThrow(ValidationError);
    expect(() => assertEmail("jan@example.com")).not.toThrow();
  });

  it("waliduje minimalną długość hasła", () => {
    expect(() => assertMinLength("12345", 6, "Hasło")).toThrow(ValidationError);
    expect(() => assertMinLength("123456", 6, "Hasło")).not.toThrow();
  });

  it("waliduje siłę hasła", () => {
    expect(() => assertPasswordStrength("abcdef")).toThrow(ValidationError);
    expect(() => assertPasswordStrength("abc123")).not.toThrow();
  });

  it("waliduje role użytkownika", () => {
    expect(() => assertUserRole("superadmin")).toThrow(ValidationError);
    expect(() => assertUserRole("admin")).not.toThrow();
    expect(() => assertUserRole("user")).not.toThrow();
  });

  it("waliduje kod waluty", () => {
    expect(() => assertCurrencyCode("PLN")).toThrow(ValidationError);
    expect(() => assertCurrencyCode("EUR")).not.toThrow();
  });
});
