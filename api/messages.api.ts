import { apiRequest } from "./api";

export const getConversations = (token: string) =>
    apiRequest("/messages/conversations", "GET", undefined, token);

export const getConversationMessages = (
    conversationId: string,
    token: string
) =>
    apiRequest(
        `/messages/conversations/${conversationId}/messages`,
        "GET",
        undefined,
        token
    );

export const createDirectConversation = (login: string, token: string) =>
    apiRequest(
        "/messages/conversations/direct",
        "POST",
        { login },
        token
    );

export const sendConversationMessage = (
    conversationId: string,
    content: string,
    token: string,
    title?: string
) =>
    apiRequest(
        `/messages/conversations/${conversationId}/messages`,
        "POST",
        title ? { content, title } : { content },
        token
    );

export const markConversationRead = (
    conversationId: string,
    token: string
) =>
    apiRequest(
        `/messages/conversations/${conversationId}/read`,
        "PATCH",
        {},
        token
    );

export const deleteConversationMessage = (
    messageId: string,
    token: string
) =>
    apiRequest(`/messages/messages/${messageId}`, "DELETE", {}, token);

export const clearConversation = (
    conversationId: string,
    token: string
) =>
    apiRequest(
        `/messages/conversations/${conversationId}/messages`,
        "DELETE",
        {},
        token
    );

export const searchContacts = (query: string, token: string) =>
    apiRequest(
        `/messages/contacts?query=${encodeURIComponent(query)}`,
        "GET",
        undefined,
        token
    );

export const sendMessage = (
    receiverLogin: string,
    title: string,
    content: string,
    token: string
) =>
    apiRequest(
        "/messages",
        "POST",
        { receiverLogin, title, content },
        token
    );