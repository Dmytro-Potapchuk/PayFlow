import { apiClient } from "@/api/api";
import { LoginRequest, AuthResponse } from "@/types/auth.types";

export async function login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/login", data);
    return response.data;
}