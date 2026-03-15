import { apiRequest } from "./api";

export const getRates = () => {
    return apiRequest("/currency/rates");
};

export const buyCurrency = (
    amountPln: number,
    currencyCode: string,
    token: string
) => {
    return apiRequest("/currency/buy", "POST", { amountPln, currencyCode }, token);
};