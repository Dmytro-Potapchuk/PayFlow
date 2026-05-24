export type NbpRate = {
    code: string;
    currency: string;
    mid: number;
};

export function normalizeNbpRates(data: unknown): NbpRate[] {
    if (!Array.isArray(data)) {
        return [];
    }

    return data
        .map((item) => {
            if (!item || typeof item !== "object") {
                return null;
            }

            const record = item as Record<string, unknown>;
            const code = typeof record.code === "string" ? record.code : "";
            const currency =
                typeof record.currency === "string" ? record.currency : "";
            const mid =
                typeof record.mid === "number"
                    ? record.mid
                    : Number(record.mid);

            if (!code || !currency || !Number.isFinite(mid) || mid <= 0) {
                return null;
            }

            return { code, currency, mid };
        })
        .filter((rate): rate is NbpRate => rate !== null);
}
