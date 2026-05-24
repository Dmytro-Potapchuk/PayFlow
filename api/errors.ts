export type ApiErrorCode =
    | "NETWORK"
    | "TIMEOUT"
    | "PARSE_ERROR"
    | "INVALID_RESPONSE"
    | "HTTP_ERROR"
    | "UNKNOWN";

export class ApiError extends Error {
    readonly status?: number;
    readonly code: ApiErrorCode;
    readonly details?: unknown;

    constructor(
        message: string,
        options?: {
            status?: number;
            code?: ApiErrorCode;
            details?: unknown;
        }
    ) {
        super(message);
        this.name = "ApiError";
        this.status = options?.status;
        this.code = options?.code ?? "HTTP_ERROR";
        this.details = options?.details;
    }
}

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ValidationError";
    }
}

export function extractErrorMessage(data: unknown, status: number): string {
    if (data && typeof data === "object") {
        const record = data as Record<string, unknown>;

        if (typeof record.message === "string" && record.message.trim()) {
            return record.message;
        }

        if (Array.isArray(record.message) && record.message.length > 0) {
            return record.message.map(String).join(", ");
        }

        if (typeof record.error === "string" && record.error.trim()) {
            return record.error;
        }
    }

    if (status === 401) {
        return "Brak autoryzacji";
    }

    if (status === 403) {
        return "Brak uprawnień";
    }

    if (status === 404) {
        return "Nie znaleziono zasobu";
    }

    if (status >= 500) {
        return "Serwer chwilowo niedostępny";
    }

    return "Wystąpił błąd";
}

export function mapFetchError(error: unknown): ApiError {
    if (error instanceof ApiError) {
        return error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
        return new ApiError("Przekroczono limit czasu połączenia", {
            code: "TIMEOUT",
        });
    }

    if (error instanceof TypeError) {
        return new ApiError("Brak połączenia z serwerem. Sprawdź internet.", {
            code: "NETWORK",
        });
    }

    if (error instanceof Error) {
        return new ApiError(error.message, { code: "UNKNOWN" });
    }

    return new ApiError("Wystąpił nieoczekiwany błąd", { code: "UNKNOWN" });
}
