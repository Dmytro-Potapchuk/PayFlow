jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

import AsyncStorage from "@react-native-async-storage/async-storage";

import { getToken, removeToken, saveToken } from "@/api/authStorage";

describe("authStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("zapisuje token", async () => {
    await saveToken("token-1");
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("token", "token-1");
  });

  it("pobiera token", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue("token-2");

    await expect(getToken()).resolves.toBe("token-2");
    expect(AsyncStorage.getItem).toHaveBeenCalledWith("token");
  });

  it("usuwa token", async () => {
    await removeToken();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith("token");
  });
});
