import {
  validateLoginForm,
  validateRegisterForm,
} from "@/utils/authFormValidation";

describe("authFormValidation", () => {
  it("odrzuca login z samych spacji", () => {
    expect(validateLoginForm("   ", "secret")).toBe("Wprowadź login i hasło");
  });

  it("akceptuje poprawny login", () => {
    expect(validateLoginForm("demo", "secret")).toBeNull();
  });

  it("waliduje email i hasło przy rejestracji", () => {
    expect(validateRegisterForm("demo", "zly-email", "secret123")).toBe(
      "Podaj poprawny adres email"
    );
    expect(validateRegisterForm("demo", "a@b.com", "123")).toMatch(
      /Hasło musi/
    );

    expect(validateRegisterForm("demo", "a@b.com", "      ")).toBe(
      "Wypełnij wszystkie pola"
    );
  });
});
