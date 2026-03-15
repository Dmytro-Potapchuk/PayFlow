import { apiRequest } from "./api";

export const createPayment = (amount: number, email: string, token: string) => {
    return apiRequest("/payu/create-payment", "POST", { amount, email }, token);
};