export function logError(context: string, error: unknown): void {
    console.error(`[PayFlow:${context}]`, error);
}
