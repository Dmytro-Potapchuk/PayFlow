export function getErrorMessage(err: unknown, fallback: string): string {
    if (err instanceof Error) return err.message;
    if (err && typeof err === "object" && "message" in err) {
        const m = (err as Record<string, unknown>).message;
        return typeof m === "string" ? m : fallback;
    }
    if (err && typeof err === "object" && "error" in err) {
        const e = (err as Record<string, unknown>).error;
        return typeof e === "string" ? e : fallback;
    }
    return fallback;
}
