import { apiRequest } from "./api";

export const getProfile = (token: string) => {
    return apiRequest("/users/profile", "GET", undefined, token);
};

export const getUsers = (token: string) => {
    return apiRequest("/users", "GET", undefined, token);
};

export const updateBalance = (id: string, balance: number, token: string) => {
    return apiRequest(`/users/${id}/balance`, "PATCH", { balance }, token);
};

export const updateRole = (id: string, role: string, token: string) => {
    return apiRequest(`/users/${id}/role`, "PATCH", { role }, token);
};