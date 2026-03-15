import { apiRequest } from "./api";

export const createTransfer = (
    receiverAccount: string,
    amount: number,
    token: string
) => {
    return apiRequest(
        "/transactions/bank-transfer",
        "POST",
        { receiverAccount, amount },
        token
    );
};

export const getHistory = (token: string) => {
    return apiRequest("/transactions/history", "GET", undefined, token);
};

export const getTransaction = (id: string, token: string) => {
    return apiRequest(`/transactions/${id}`, "GET", undefined, token);
};