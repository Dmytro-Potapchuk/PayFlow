import { endpoints } from "./endpoints";
import { httpClient } from "./httpClient";
import { assertToken } from "./validation";
import type { DashboardData } from "@/types/api.types";

export async function getDashboard(token: string): Promise<DashboardData> {
    assertToken(token);

    return httpClient.get<DashboardData>(endpoints.dashboard.root(), token);
}
