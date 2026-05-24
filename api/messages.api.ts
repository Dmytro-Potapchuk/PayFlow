import { endpoints } from "./endpoints";
import { httpClient } from "./httpClient";
import {
    assertNonEmptyString,
    assertResourceId,
    assertToken,
} from "./validation";
import type {
    ChatMessage,
    ContactSearchResult,
    ConversationSummary,
} from "@/types/message";

export async function getConversations(
    token: string
): Promise<ConversationSummary[]> {
    assertToken(token);

    return httpClient.get<ConversationSummary[]>(
        endpoints.messages.conversations(),
        token
    );
}

export async function getConversationMessages(
    conversationId: string,
    token: string
): Promise<ChatMessage[]> {
    assertToken(token);
    assertResourceId(conversationId, "Identyfikator rozmowy");

    return httpClient.get<ChatMessage[]>(
        endpoints.messages.conversationMessages(conversationId),
        token
    );
}

export async function createDirectConversation(
    login: string,
    token: string
): Promise<ConversationSummary> {
    assertToken(token);
    assertNonEmptyString(login, "Login");

    return httpClient.post<ConversationSummary>(
        endpoints.messages.directConversation(),
        { login: login.trim() },
        token
    );
}

export async function sendConversationMessage(
    conversationId: string,
    content: string,
    token: string,
    title?: string
): Promise<ChatMessage> {
    assertToken(token);
    assertResourceId(conversationId, "Identyfikator rozmowy");
    assertNonEmptyString(content, "Treść wiadomości");

    const body: Record<string, unknown> = title
        ? { content: content.trim(), title: title.trim() }
        : { content: content.trim() };

    return httpClient.post<ChatMessage>(
        endpoints.messages.conversationMessages(conversationId),
        body,
        token
    );
}

export async function markConversationRead(
    conversationId: string,
    token: string
): Promise<void> {
    assertToken(token);
    assertResourceId(conversationId, "Identyfikator rozmowy");

    await httpClient.patch(
        endpoints.messages.markRead(conversationId),
        {},
        token
    );
}

export async function deleteConversationMessage(
    messageId: string,
    token: string
): Promise<void> {
    assertToken(token);
    assertResourceId(messageId, "Identyfikator wiadomości");

    await httpClient.delete(
        endpoints.messages.deleteMessage(messageId),
        {},
        token
    );
}

export async function clearConversation(
    conversationId: string,
    token: string
): Promise<void> {
    assertToken(token);
    assertResourceId(conversationId, "Identyfikator rozmowy");

    await httpClient.delete(
        endpoints.messages.conversationMessages(conversationId),
        {},
        token
    );
}

export async function searchContacts(
    query: string,
    token: string
): Promise<ContactSearchResult[]> {
    assertToken(token);

    return httpClient.get<ContactSearchResult[]>(
        endpoints.messages.contacts(query),
        token
    );
}

export async function sendMessage(
    receiverLogin: string,
    title: string,
    content: string,
    token: string
): Promise<ChatMessage> {
    assertToken(token);
    assertNonEmptyString(receiverLogin, "Login odbiorcy");
    assertNonEmptyString(title, "Tytuł");
    assertNonEmptyString(content, "Treść");

    return httpClient.post<ChatMessage>(
        endpoints.messages.root(),
        {
            receiverLogin: receiverLogin.trim(),
            title: title.trim(),
            content: content.trim(),
        },
        token
    );
}
