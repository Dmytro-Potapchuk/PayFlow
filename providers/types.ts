import type { MessageType } from "@/types/message";

export type RefreshOptions = {
    silent?: boolean;
    skipToast?: boolean;
};

export type Toast = {
    id: string;
    title: string;
    message: string;
    type: MessageType;
};

export type ConversationSnapshot = {
    preview: string;
    unreadCount: number;
    lastMessageAt?: string;
};

export type ConversationSnapshotMap = Record<string, ConversationSnapshot>;
