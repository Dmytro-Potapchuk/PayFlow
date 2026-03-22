jest.mock("@/api/api", () => ({
  apiRequest: jest.fn(),
}));

import { apiRequest } from "@/api/api";
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

const apiRequestMock = apiRequest as jest.Mock;

describe("api wrapper modules", () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
    apiRequestMock.mockResolvedValue({ ok: true });
  });

  it("obsługuje endpointy auth", async () => {
    await login("demo", "pass");
    await register("demo", "demo@example.com", "pass123");

    expect(apiRequestMock).toHaveBeenNthCalledWith(1, "/auth/login", "POST", {
      login: "demo",
      password: "pass",
    });
    expect(apiRequestMock).toHaveBeenNthCalledWith(
      2,
      "/auth/register",
      "POST",
      {
        login: "demo",
        email: "demo@example.com",
        password: "pass123",
      }
    );
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

    expect(apiRequestMock).toHaveBeenCalledWith(
      "/dashboard",
      "GET",
      undefined,
      "token-1"
    );
    expect(apiRequestMock).toHaveBeenCalledWith(
      "/users/profile",
      "GET",
      undefined,
      "token-1"
    );
    expect(apiRequestMock).toHaveBeenCalledWith("/users", "GET", undefined, "token-1");
    expect(apiRequestMock).toHaveBeenCalledWith(
      "/users/u1/balance",
      "PATCH",
      { balance: 320 },
      "token-1"
    );
    expect(apiRequestMock).toHaveBeenCalledWith(
      "/users/u1/role",
      "PATCH",
      { role: "admin" },
      "token-1"
    );
    expect(apiRequestMock).toHaveBeenCalledWith(
      "/transactions/bank-transfer",
      "POST",
      { receiverAccount: "PL001", amount: 99 },
      "token-1"
    );
    expect(apiRequestMock).toHaveBeenCalledWith(
      "/transactions/history",
      "GET",
      undefined,
      "token-1"
    );
    expect(apiRequestMock).toHaveBeenCalledWith(
      "/transactions/tx-1",
      "GET",
      undefined,
      "token-1"
    );
    expect(apiRequestMock).toHaveBeenCalledWith("/currency/rates");
    expect(apiRequestMock).toHaveBeenCalledWith(
      "/currency/buy",
      "POST",
      { amountPln: 120, currencyCode: "EUR" },
      "token-1"
    );
    expect(apiRequestMock).toHaveBeenCalledWith(
      "/payu/create-payment",
      "POST",
      { amount: 250, email: "demo@example.com" },
      "token-1"
    );
    expect(apiRequestMock).toHaveBeenCalledWith(
      "/payu/create-payment",
      "POST",
      {
        amount: 250,
        email: "demo@example.com",
        continueUrl: "https://continue",
      },
      "token-1"
    );
    expect(apiRequestMock).toHaveBeenCalledWith(
      "/payu/confirm/order-1",
      "GET",
      undefined,
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
    await searchContacts("zażółć gęślą", "token-1");
    await sendMessage("anna", "Temat", "Treść", "token-1");

    expect(apiRequestMock).toHaveBeenCalledWith(
      "/messages/conversations",
      "GET",
      undefined,
      "token-1"
    );
    expect(apiRequestMock).toHaveBeenCalledWith(
      "/messages/conversations/c1/messages",
      "GET",
      undefined,
      "token-1"
    );
    expect(apiRequestMock).toHaveBeenCalledWith(
      "/messages/conversations/direct",
      "POST",
      { login: "anna" },
      "token-1"
    );
    expect(apiRequestMock).toHaveBeenCalledWith(
      "/messages/conversations/c1/messages",
      "POST",
      { content: "hej" },
      "token-1"
    );
    expect(apiRequestMock).toHaveBeenCalledWith(
      "/messages/conversations/c1/messages",
      "POST",
      { content: "hej", title: "Tytuł" },
      "token-1"
    );
    expect(apiRequestMock).toHaveBeenCalledWith(
      "/messages/conversations/c1/read",
      "PATCH",
      {},
      "token-1"
    );
    expect(apiRequestMock).toHaveBeenCalledWith(
      "/messages/messages/m1",
      "DELETE",
      {},
      "token-1"
    );
    expect(apiRequestMock).toHaveBeenCalledWith(
      "/messages/conversations/c1/messages",
      "DELETE",
      {},
      "token-1"
    );
    expect(apiRequestMock).toHaveBeenCalledWith(
      "/messages/contacts?query=za%C5%BC%C3%B3%C5%82%C4%87%20g%C4%99%C5%9Bl%C4%85",
      "GET",
      undefined,
      "token-1"
    );
    expect(apiRequestMock).toHaveBeenCalledWith(
      "/messages",
      "POST",
      { receiverLogin: "anna", title: "Temat", content: "Treść" },
      "token-1"
    );
  });
});
