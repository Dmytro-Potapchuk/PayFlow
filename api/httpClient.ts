import { resolveApiUrl } from "@/constants/apiConfig";

import { ApiError, extractErrorMessage, mapFetchError } from "./errors";

export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;

export const API_URL = resolveApiUrl();

export type ApiRequestOptions = {
    method?: HttpMethod;
    body?: Record<string, unknown>;
    token?: string;
    timeoutMs?: number;
};

function buildUrl(endpoint: string): string {
    if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
        return endpoint;
    }

    const normalizedEndpoint = endpoint.startsWith("/")
        ? endpoint
        : `/${endpoint}`;

    return `${API_URL.replace(/\/$/, "")}${normalizedEndpoint}`;
}

async function parseResponseBody(
    response: Response
): Promise<unknown> {
    const contentType = response.headers.get("content-type") ?? "";
    const text = await response.text();

    if (!text.trim()) {
        return null;
    }

    const looksLikeJson =
        contentType.includes("application/json") ||
        text.trim().startsWith("{") ||
        text.trim().startsWith("[");

    if (!looksLikeJson) {
        throw new ApiError(
            response.ok
                ? "Nieoczekiwany format odpowiedzi serwera"
                : `Błąd serwera (${response.status})`,
            {
                status: response.status,
                code: "INVALID_RESPONSE",
            }
        );
    }

    try {
        return JSON.parse(text) as unknown;
    } catch {
        throw new ApiError("Nie udało się odczytać odpowiedzi serwera", {
            status: response.status,
            code: "PARSE_ERROR",
        });
    }
}

export async function apiRequest<T>(
    endpoint: string,
    method: HttpMethod = "GET",
    body?: Record<string, unknown>,
    token?: string,
    timeoutMs: number = DEFAULT_REQUEST_TIMEOUT_MS
): Promise<T> {
    return request<T>(endpoint, {
        method,
        body,
        token,
        timeoutMs,
    });
}

export async function request<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
): Promise<T> {
    const {
        method = "GET",
        body,
        token,
        timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
    } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(buildUrl(endpoint), {
            method,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
        });

        const data = await parseResponseBody(response);

        if (!response.ok) {
            throw new ApiError(extractErrorMessage(data, response.status), {
                status: response.status,
                code: "HTTP_ERROR",
            });
        }

        return data as T;
    } catch (error) {
        throw mapFetchError(error);
    } finally {
        clearTimeout(timeoutId);
    }
}

export const httpClient = {
    get: <T>(endpoint: string, token?: string, timeoutMs?: number) =>
        request<T>(endpoint, { method: "GET", token, timeoutMs }),

    post: <T>(
        endpoint: string,
        body?: Record<string, unknown>,
        token?: string,
        timeoutMs?: number
    ) => request<T>(endpoint, { method: "POST", body, token, timeoutMs }),

    patch: <T>(
        endpoint: string,
        body?: Record<string, unknown>,
        token?: string,
        timeoutMs?: number
    ) => request<T>(endpoint, { method: "PATCH", body, token, timeoutMs }),

    put: <T>(
        endpoint: string,
        body?: Record<string, unknown>,
        token?: string,
        timeoutMs?: number
    ) => request<T>(endpoint, { method: "PUT", body, token, timeoutMs }),

    delete: <T>(
        endpoint: string,
        body?: Record<string, unknown>,
        token?: string,
        timeoutMs?: number
    ) => request<T>(endpoint, { method: "DELETE", body, token, timeoutMs }),
};
