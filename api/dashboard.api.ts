import { apiRequest } from "./api";

export const getDashboard = async (token: string) => {

    return apiRequest(
        "/dashboard",
        "GET",
        undefined,
        token
    );

};