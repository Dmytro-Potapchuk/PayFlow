import { endpoints } from "./endpoints";
import { httpClient } from "./httpClient";
import {
    assertCurrencyCode,
    assertMinAmount,
    assertToken,
} from "./validation";
import type { CurrencyBuyResponse, CurrencyCode } from "@/types/api.types";
import { normalizeNbpRates, type NbpRate } from "@/utils/nbpRates";

export async function getRates(): Promise<NbpRate[]> {
    const data = await httpClient.get<unknown>(endpoints.currency.rates());
    return normalizeNbpRates(data);
}

export async function buyCurrency(
    amountPln: number,
    currencyCode: CurrencyCode,
    token: string
): Promise<CurrencyBuyResponse> {
    assertToken(token);
    assertMinAmount(amountPln, 0.01, "Kwota");
    assertCurrencyCode(currencyCode);

    return httpClient.post<CurrencyBuyResponse>(
        endpoints.currency.buy(),
        { amountPln, currencyCode },
        token
    );
}
