const encode = encodeURIComponent;

export const endpoints = {
    auth: {
        login: () => "/auth/login",
        register: () => "/auth/register",
    },
    dashboard: {
        root: () => "/dashboard",
    },
    users: {
        profile: () => "/users/profile",
        lookup: (login: string) =>
            `/users/lookup?login=${encode(login.trim())}`,
        list: () => "/users",
        balance: (userId: string) => `/users/${encode(userId)}/balance`,
        role: (userId: string) => `/users/${encode(userId)}/role`,
    },
    transactions: {
        bankTransfer: () => "/transactions/bank-transfer",
        history: (page = 1, limit = 20) =>
            `/transactions/history?page=${page}&limit=${limit}`,
        byId: (transactionId: string) =>
            `/transactions/${encode(transactionId)}`,
    },
    currency: {
        rates: () => "/currency/rates",
        buy: () => "/currency/buy",
        sell: () => "/currency/sell",
    },
    payu: {
        createPayment: () => "/payu/create-payment",
        confirm: (externalOrderId: string) =>
            `/payu/confirm/${encode(externalOrderId)}`,
    },
    messages: {
        root: () => "/messages",
        conversations: () => "/messages/conversations",
        conversationMessages: (conversationId: string) =>
            `/messages/conversations/${encode(conversationId)}/messages`,
        directConversation: () => "/messages/conversations/direct",
        markRead: (conversationId: string) =>
            `/messages/conversations/${encode(conversationId)}/read`,
        deleteMessage: (messageId: string) =>
            `/messages/messages/${encode(messageId)}`,
        contacts: (query = "") => {
            const trimmed = query.trim();
            return trimmed
                ? `/messages/contacts?query=${encode(trimmed)}`
                : "/messages/contacts";
        },
    },
} as const;
