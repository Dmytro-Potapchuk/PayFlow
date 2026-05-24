import { normalizeNbpRates } from "@/utils/nbpRates";

describe("normalizeNbpRates", () => {
  it("zwraca poprawną tablicę kursów", () => {
    expect(
      normalizeNbpRates([
        { code: "EUR", currency: "euro", mid: 4.31 },
        { code: "USD", currency: "dolar", mid: 3.98 },
      ])
    ).toEqual([
      { code: "EUR", currency: "euro", mid: 4.31 },
      { code: "USD", currency: "dolar", mid: 3.98 },
    ]);
  });

  it("odrzuca niepoprawne wpisy", () => {
    expect(
      normalizeNbpRates([
        { code: "EUR", currency: "euro", mid: "invalid" },
        null,
        { code: "", currency: "x", mid: 1 },
      ])
    ).toEqual([]);
  });

  it("zwraca pustą tablicę dla nie-tablicy", () => {
    expect(normalizeNbpRates({ EUR: 4.31 })).toEqual([]);
  });
});
