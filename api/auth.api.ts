import { apiRequest } from "./api";

export const login = (login: string, password: string) => {
    return apiRequest("/auth/login", "POST", { login, password });
};

export const register = (login: string, email: string, password: string) => {
    return apiRequest("/auth/register", "POST", { login, email, password });
};