export type MessageType = "success" | "error" | "info";

export type ConversationType = "direct" | "system";

export interface ConversationParticipant {
    _id: string;
    login: string;
    email: string;
    role?: string;
}

export interface ConversationSummary {
    _id: string;
    type: ConversationType;
    title: string;
    preview: string;
    unreadCount: number;
    lastMessageAt?: string;
    lastMessageType?: MessageType;
    participant: ConversationParticipant | null;
}

export interface ChatMessage {
    _id: string;
    conversationId: string;
    title?: string;
    content: string;
    read: boolean;
    isOwn: boolean;
    senderId?: string;
    senderLogin?: string;
    createdAt?: string;
    updatedAt?: string;
    type?: MessageType;
}

export interface ContactSearchResult {
    _id: string;
    login: string;
    email: string;
    role?: string;
}
