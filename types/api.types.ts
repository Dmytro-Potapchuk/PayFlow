import type { DashboardData } from "./dashboard";
import type { Transaction } from "./transaction";

export type UserRole = "user" | "admin";

export type CurrencyCode = "EUR" | "USD";

export interface LoginResponse {
    access_token: string;
}

export interface RegisterResponse {
    _id: string;
    login: string;
    email: string;
    role?: UserRole;
}

export interface UserProfile {
    _id: string;
    login: string;
    email: string;
    role: UserRole;
    phone?: string;
    balance?: number;
}

export interface AdminUserSummary {
    _id: string;
    login: string;
    email: string;
    role: UserRole;
    balance?: number;
}

export interface PayuCreatePaymentResponse {
    redirectUrl: string;
    externalOrderId: string;
}

export interface PayuConfirmPaymentResponse {
    status: string;
    externalOrderId?: string;
    message?: string;
    balanceApplied?: boolean;
}

export interface CurrencyBuyResponse {
    success: boolean;
    balance: number;
    balanceEur: number;
    balanceUsd: number;
    boughtAmount: number;
    currencyCode: string;
}

export type { DashboardData };
