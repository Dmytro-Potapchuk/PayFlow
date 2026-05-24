export const PAYU_MAX_TOP_UP_PLN = 50_000;

export function validatePayuAmount(amount: string): string | null {
    const trimmed = amount.trim();

    if (!trimmed) {
        return "Podaj kwotę doładowania";
    }

    const value = Number(trimmed);

    if (!Number.isFinite(value) || value <= 0) {
        return "Niepoprawna kwota";
    }

    if (value > PAYU_MAX_TOP_UP_PLN) {
        return `Maksymalna kwota doładowania to ${PAYU_MAX_TOP_UP_PLN.toLocaleString("pl-PL")} PLN`;
    }

    return null;
}
