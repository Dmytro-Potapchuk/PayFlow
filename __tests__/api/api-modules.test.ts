const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPatch = jest.fn();
const mockDelete = jest.fn();

jest.mock("@/api/httpClient", () => ({
  httpClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

import { login, register } from "@/api/auth.api";
import { getDashboard } from "@/api/dashboard.api";
import {
  clearConversation,
  createDirectConversation,
  deleteConversationMessage,
  getConversationMessages,
  getConversations,
  markConversationRead,
  searchContacts,
  sendConversationMessage,
  sendMessage,
} from "@/api/messages.api";
import { createPayment, confirmPayment } from "@/api/payu.api";
import {
  createTransfer,
  getHistory,
  getTransaction,
} from "@/api/transactions.api";
import { getRates, buyCurrency } from "@/api/currency.api";
import {
  getProfile,
  getUsers,
  updateBalance,
  updateRole,
} from "@/api/users.api";

describe("api wrapper modules", () => {
  beforeEach(() => {
    mockGet.mockReset().mockResolvedValue({ ok: true });
    mockPost.mockReset().mockResolvedValue({ ok: true });
    mockPatch.mockReset().mockResolvedValue({ ok: true });
    mockDelete.mockReset().mockResolvedValue({ ok: true });
  });

  it("obsługuje endpointy auth", async () => {
    await login("demo", "pass");
    await register("demo", "demo@example.com", "pass123");

    expect(mockPost).toHaveBeenNthCalledWith(1, "/auth/login", {
      login: "demo",
      password: "pass",
    });
    expect(mockPost).toHaveBeenNthCalledWith(2, "/auth/register", {
      login: "demo",
      email: "demo@example.com",
      password: "pass123",
    });
  });

  it("odrzuca niepoprawne dane auth przed wywołaniem API", async () => {
    await expect(login("", "pass")).rejects.toThrow("Login nie może być puste");
    await expect(
      register("demo", "zly-email", "pass123")
    ).rejects.toThrow("Podaj poprawny adres email");
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("obsługuje dashboard, users, transactions, currency i payu", async () => {
    await getDashboard("token-1");
    await getProfile("token-1");
    await getUsers("token-1");
    await updateBalance("u1", 320, "token-1");
    await updateRole("u1", "admin", "token-1");
    await createTransfer("PL001", 99, "token-1");
    await getHistory("token-1");
    await getTransaction("tx-1", "token-1");
    await getRates();
    await buyCurrency(120, "EUR", "token-1");
    await createPayment(250, "demo@example.com", "token-1");
    await createPayment(250, "demo@example.com", "token-1", "https://continue");
    await confirmPayment("order-1", "token-1");

    expect(mockGet).toHaveBeenCalledWith("/dashboard", "token-1");
    expect(mockGet).toHaveBeenCalledWith("/users/profile", "token-1");
    expect(mockGet).toHaveBeenCalledWith("/users", "token-1");
    expect(mockPatch).toHaveBeenCalledWith(
      "/users/u1/balance",
      { balance: 320 },
      "token-1"
    );
    expect(mockPatch).toHaveBeenCalledWith(
      "/users/u1/role",
      { role: "admin" },
      "token-1"
    );
    expect(mockPost).toHaveBeenCalledWith(
      "/transactions/bank-transfer",
      { receiverAccount: "PL001", amount: 99 },
      "token-1"
    );
    expect(mockGet).toHaveBeenCalledWith("/transactions/history", "token-1");
    expect(mockGet).toHaveBeenCalledWith("/transactions/tx-1", "token-1");
    expect(mockGet).toHaveBeenCalledWith("/currency/rates");
    expect(mockPost).toHaveBeenCalledWith(
      "/currency/buy",
      { amountPln: 120, currencyCode: "EUR" },
      "token-1"
    );
    expect(mockPost).toHaveBeenCalledWith(
      "/payu/create-payment",
      { amount: 250, email: "demo@example.com" },
      "token-1"
    );
    expect(mockPost).toHaveBeenCalledWith(
      "/payu/create-payment",
      {
        amount: 250,
        email: "demo@example.com",
        continueUrl: "https://continue",
      },
      "token-1"
    );
    expect(mockGet).toHaveBeenCalledWith("/payu/confirm/order-1", "token-1");
  });

  it("koduje identyfikatory w ścieżkach URL", async () => {
    await getTransaction("id/with/slash", "token-1");
    await confirmPayment("order id", "token-1");
    await deleteConversationMessage("msg/id", "token-1");

    expect(mockGet).toHaveBeenCalledWith(
      "/transactions/id%2Fwith%2Fslash",
      "token-1"
    );
    expect(mockGet).toHaveBeenCalledWith(
      "/payu/confirm/order%20id",
      "token-1"
    );
    expect(mockDelete).toHaveBeenCalledWith(
      "/messages/messages/msg%2Fid",
      {},
      "token-1"
    );
  });

  it("obsługuje endpointy wiadomości", async () => {
    await getConversations("token-1");
    await getConversationMessages("c1", "token-1");
    await createDirectConversation("anna", "token-1");
    await sendConversationMessage("c1", "hej", "token-1");
    await sendConversationMessage("c1", "hej", "token-1", "Tytuł");
    await markConversationRead("c1", "token-1");
    await deleteConversationMessage("m1", "token-1");
    await clearConversation("c1", "token-1");
    await searchContacts("", "token-1");
    await searchContacts("zażółć gęślą", "token-1");
    await sendMessage("anna", "Temat", "Treść", "token-1");

    expect(mockGet).toHaveBeenCalledWith("/messages/conversations", "token-1");
    expect(mockGet).toHaveBeenCalledWith(
      "/messages/conversations/c1/messages",
      "token-1"
    );
    expect(mockPost).toHaveBeenCalledWith(
      "/messages/conversations/direct",
      { login: "anna" },
      "token-1"
    );
    expect(mockPost).toHaveBeenCalledWith(
      "/messages/conversations/c1/messages",
      { content: "hej" },
      "token-1"
    );
    expect(mockPost).toHaveBeenCalledWith(
      "/messages/conversations/c1/messages",
      { content: "hej", title: "Tytuł" },
      "token-1"
    );
    expect(mockPatch).toHaveBeenCalledWith(
      "/messages/conversations/c1/read",
      {},
      "token-1"
    );
    expect(mockDelete).toHaveBeenCalledWith(
      "/messages/messages/m1",
      {},
      "token-1"
    );
    expect(mockDelete).toHaveBeenCalledWith(
      "/messages/conversations/c1/messages",
      {},
      "token-1"
    );
    expect(mockGet).toHaveBeenCalledWith("/messages/contacts", "token-1");
    expect(mockGet).toHaveBeenCalledWith(
      "/messages/contacts?query=za%C5%BC%C3%B3%C5%82%C4%87%20g%C4%99%C5%9Bl%C4%85",
      "token-1"
    );
    expect(mockPost).toHaveBeenCalledWith(
      "/messages",
      { receiverLogin: "anna", title: "Temat", content: "Treść" },
      "token-1"
    );
  });
});
