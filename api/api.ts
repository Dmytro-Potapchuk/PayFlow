export async function apiRequest<T = unknown>(
    endpoint: string,
    method: string = "GET",
    body?: Record<string, unknown>,
    token?: string
): Promise<T> {

    const response = await fetch(`http://192.168.33.2:3000${endpoint}`, {
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