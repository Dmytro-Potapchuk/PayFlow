import { endpoints } from "./endpoints";
import { httpClient } from "./httpClient";
import {
    assertEmail,
    assertPositiveNumber,
    assertResourceId,
    assertToken,
} from "./validation";
import type {
    PayuConfirmPaymentResponse,
    PayuCreatePaymentResponse,
} from "@/types/api.types";

export async function createPayment(
    amount: number,
    email: string,
    token: string,
    continueUrl?: string
): Promise<PayuCreatePaymentResponse> {
    assertToken(token);
    assertPositiveNumber(amount, "Kwota");
    assertEmail(email);

    const body: Record<string, unknown> = continueUrl
        ? { amount, email: email.trim(), continueUrl: continueUrl.trim() }
        : { amount, email: email.trim() };

    return httpClient.post<PayuCreatePaymentResponse>(
        endpoints.payu.createPayment(),
        body,
        token
    );
}

export async function confirmPayment(
    externalOrderId: string,
    token: string
): Promise<PayuConfirmPaymentResponse> {
    assertToken(token);
    assertResourceId(externalOrderId, "Identyfikator zamówienia");

    return httpClient.get<PayuConfirmPaymentResponse>(
        endpoints.payu.confirm(externalOrderId),
        token
    );
}
