export const PRODUCTION_API_URL =
    process.env.EXPO_PUBLIC_API_URL?.trim() || "https://api.payflow.waw.pl";

export const DEV_API_URL =
    process.env.EXPO_PUBLIC_DEV_API_URL?.trim() || "http://localhost:3000";

export function resolveApiUrl(isDev: boolean = __DEV__): string {
    return isDev ? DEV_API_URL : PRODUCTION_API_URL;
}

export function collectApiOrigins(): string[] {
    const origins = new Set<string>();

    const add = (value?: string) => {
        const trimmed = value?.trim();
        if (!trimmed) {
            return;
        }

        try {
            origins.add(new URL(trimmed).origin);
        } catch {
            // ignore invalid URL
        }
    };

    add(PRODUCTION_API_URL);
    add(DEV_API_URL);
    add(process.env.EXPO_PUBLIC_API_URL);
    add(process.env.EXPO_PUBLIC_DEV_API_URL);

    return Array.from(origins);
}
