const API_URL = __DEV__
    ? "http://192.67.197.185:3000"
    : "https://dom.payflow.waw.pl";

export async function apiRequest<T = unknown>(
    endpoint: string,
    method: string = "GET",
    body?: Record<string, unknown>,
    token?: string
): Promise<T> {

    const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` })
        },
        body: body ? JSON.stringify(body) : undefined
    });

    const data = await response.json();

    if (!response.ok) {
        throw data;
    }

    return data;
}