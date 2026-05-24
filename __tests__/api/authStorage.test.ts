jest.mock("@/api/secureStorage", () => ({
  setSecureItem: jest.fn(),
  getSecureItem: jest.fn(),
  removeSecureItem: jest.fn(),
}));

import {
  getSecureItem,
  removeSecureItem,
  setSecureItem,
} from "@/api/secureStorage";

import { getToken, removeToken, saveToken } from "@/api/authStorage";

describe("authStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("zapisuje token w secure storage", async () => {
    await saveToken("token-1");
    expect(setSecureItem).toHaveBeenCalledWith(
      "@payflow/auth/access_token",
      "token-1"
    );
  });

  it("pobiera token", async () => {
    (getSecureItem as jest.Mock).mockResolvedValue("token-2");

    await expect(getToken()).resolves.toBe("token-2");
    expect(getSecureItem).toHaveBeenCalledWith("@payflow/auth/access_token");
  });

  it("usuwa token", async () => {
    await removeToken();
    expect(removeSecureItem).toHaveBeenCalledWith("@payflow/auth/access_token");
  });
});
