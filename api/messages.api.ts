import { apiRequest } from "./api";

export const sendMessage = (
    receiverLogin: string,
    title: string,
    content: string,
    token: string
) => {
    return apiRequest(
        "/messages",
        "POST",
        { receiverLogin, title, content },
        token
    );
};

export const getMessages = (token: string) => {
    return apiRequest("/messages", "GET", undefined, token);
};

export const getMessage = (id: string, token: string) => {
    return apiRequest(`/messages/${id}`, "GET", undefined, token);
};

export const readMessage = (id: string, token: string) => {
    return apiRequest(`/messages/${id}/read`, "PATCH", {}, token);
};