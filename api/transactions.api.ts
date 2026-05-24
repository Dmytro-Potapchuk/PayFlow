import { endpoints } from "./endpoints";
import { httpClient } from "./httpClient";
import {
    assertPositiveNumber,
    assertResourceId,
    assertToken,
    assertNonEmptyString,
} from "./validation";
import type { Transaction } from "@/types/transaction";

export async function createTransfer(
    receiverAccount: string,
    amount: number,
    token: string
): Promise<Transaction> {
    assertToken(token);
    assertNonEmptyString(receiverAccount, "Konto odbiorcy");
    assertPositiveNumber(amount, "Kwota");

    return httpClient.post<Transaction>(
        endpoints.transactions.bankTransfer(),
        { receiverAccount: receiverAccount.trim(), amount },
        token
    );
}

export async function getHistory(token: string): Promise<Transaction[]> {
    assertToken(token);

    return httpClient.get<Transaction[]>(
        endpoints.transactions.history(),
        token
    );
}

export async function getTransaction(
    id: string,
    token: string
): Promise<Transaction> {
    assertToken(token);
    assertResourceId(id, "Identyfikator transakcji");

    return httpClient.get<Transaction>(endpoints.transactions.byId(id), token);
}
