import { endpoints } from "./endpoints";
import { httpClient } from "./httpClient";
import {
    assertEmail,
    assertNonEmptyString,
    assertPasswordStrength,
} from "./validation";
import type { LoginResponse, RegisterResponse } from "@/types/api.types";

export async function login(
    loginValue: string,
    password: string
): Promise<LoginResponse> {
    assertNonEmptyString(loginValue, "Login");
    assertNonEmptyString(password, "Hasło");

    return httpClient.post<LoginResponse>(endpoints.auth.login(), {
        login: loginValue.trim(),
        password,
    });
}

export async function register(
    loginValue: string,
    email: string,
    password: string
): Promise<RegisterResponse> {
    assertNonEmptyString(loginValue, "Login");
    assertEmail(email);
    assertPasswordStrength(password);

    return httpClient.post<RegisterResponse>(endpoints.auth.register(), {
        login: loginValue.trim(),
        email: email.trim(),
        password,
    });
}
