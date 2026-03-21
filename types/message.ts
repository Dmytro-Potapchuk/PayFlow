export type MessageType = "success" | "error" | "info";

export interface Message {
    _id: string;
    title: string;
    content: string;
    read: boolean;
    senderLogin?: string;
    createdAt?: string;
    type?: MessageType;
}
