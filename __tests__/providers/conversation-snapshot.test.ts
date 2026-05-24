import { buildConversationSnapshot } from "@/providers/conversationSnapshot";
import type { ConversationSummary } from "@/types/message";

describe("buildConversationSnapshot", () => {
  it("buduje mapę tylko z aktualnych rozmów", () => {
    const conversations: ConversationSummary[] = [
      {
        _id: "c1",
        type: "direct",
        title: "Anna",
        preview: "Cześć",
        unreadCount: 1,
        lastMessageAt: "2026-05-24T10:00:00.000Z",
        participant: null,
      },
      {
        _id: "c2",
        type: "direct",
        title: "Jan",
        preview: "OK",
        unreadCount: 0,
        participant: null,
      },
    ];

    const snapshot = buildConversationSnapshot(conversations);

    expect(Object.keys(snapshot)).toEqual(["c1", "c2"]);
    expect(snapshot.c1).toEqual({
      preview: "Cześć",
      unreadCount: 1,
      lastMessageAt: "2026-05-24T10:00:00.000Z",
    });
  });

  it("usuwa wpisy po zniknięciu rozmowy z listy", () => {
    const first = buildConversationSnapshot([
      {
        _id: "c1",
        type: "direct",
        title: "Anna",
        preview: "Cześć",
        unreadCount: 1,
        participant: null,
      },
      {
        _id: "c2",
        type: "direct",
        title: "Jan",
        preview: "OK",
        unreadCount: 0,
        participant: null,
      },
    ]);

    const second = buildConversationSnapshot([
      {
        _id: "c2",
        type: "direct",
        title: "Jan",
        preview: "OK",
        unreadCount: 0,
        participant: null,
      },
    ]);

    expect(Object.keys(first)).toEqual(["c1", "c2"]);
    expect(Object.keys(second)).toEqual(["c2"]);
  });
});
