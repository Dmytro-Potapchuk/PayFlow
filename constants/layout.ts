export const LAYOUT = {
    compactMaxWidth: 430,
    messagesWideMinWidth: 960,
} as const;

export function isCompactWidth(width: number): boolean {
    return width <= LAYOUT.compactMaxWidth;
}

export function isMessagesWideLayout(width: number): boolean {
    return width >= LAYOUT.messagesWideMinWidth;
}
