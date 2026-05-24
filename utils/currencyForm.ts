import type { NbpRate } from "@/utils/nbpRates";

const MAX_PLN_AMOUNT = 1_000_000;

export function validatePlnAmount(amountPln: string): string | null {
    const trimmed = amountPln.trim();

    if (!trimmed) {
        return "Podaj kwotę w PLN";
    }

    const amount = Number(trimmed);

    if (!Number.isFinite(amount) || amount <= 0) {
        return "Podaj poprawną kwotę w PLN";
    }

    if (amount > MAX_PLN_AMOUNT) {
        return `Maksymalna kwota to ${MAX_PLN_AMOUNT.toLocaleString("pl-PL")} PLN`;
    }

    return null;
}

export function canBuyCurrency(rate: NbpRate | null): rate is NbpRate {
    return rate?.code === "EUR" || rate?.code === "USD";
}

export function buildConversionResult(
    amountPln: number,
    rate: NbpRate
): string {
    const foreignAmount = amountPln / rate.mid;
    return `${amountPln.toFixed(2)} PLN = ${foreignAmount.toFixed(2)} ${rate.code}`;
}
