import { endpoints } from "./endpoints";
import { httpClient } from "./httpClient";
import {
    assertPositiveNumber,
    assertResourceId,
    assertToken,
    assertUserRole,
} from "./validation";
import type {
    AdminUserSummary,
    UserProfile,
    UserRole,
} from "@/types/api.types";

export async function getProfile(token: string): Promise<UserProfile> {
    assertToken(token);

    return httpClient.get<UserProfile>(endpoints.users.profile(), token);
}

export async function getUsers(token: string): Promise<AdminUserSummary[]> {
    assertToken(token);

    return httpClient.get<AdminUserSummary[]>(endpoints.users.list(), token);
}

export async function updateBalance(
    id: string,
    balance: number,
    token: string
): Promise<AdminUserSummary> {
    assertToken(token);
    assertResourceId(id, "Identyfikator użytkownika");
    assertPositiveNumber(balance, "Saldo");

    return httpClient.patch<AdminUserSummary>(
        endpoints.users.balance(id),
        { balance },
        token
    );
}

export async function updateRole(
    id: string,
    role: UserRole,
    token: string
): Promise<AdminUserSummary> {
    assertToken(token);
    assertResourceId(id, "Identyfikator użytkownika");
    assertUserRole(role);

    return httpClient.patch<AdminUserSummary>(
        endpoints.users.role(id),
        { role },
        token
    );
}
