import type { ConversationSummary } from "@/types/message";

import type { ConversationSnapshotMap } from "./types";

export function buildConversationSnapshot(
    conversations: ConversationSummary[]
): ConversationSnapshotMap {
    const snapshot: ConversationSnapshotMap = {};

    for (const conversation of conversations) {
        snapshot[conversation._id] = {
            preview: conversation.preview,
            unreadCount: conversation.unreadCount,
            lastMessageAt: conversation.lastMessageAt,
        };
    }

    return snapshot;
}
