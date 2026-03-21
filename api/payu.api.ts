import { apiRequest } from "./api";

export const createPayment = (
    amount: number,
    email: string,
    token: string,
    continueUrl?: string
) => {
    return apiRequest(
        "/payu/create-payment",
        "POST",
        continueUrl ? { amount, email, continueUrl } : { amount, email },
        token
    );
};

export const confirmPayment = (externalOrderId: string, token: string) => {
    return apiRequest(`/payu/confirm/${externalOrderId}`, "GET", undefined, token);
};