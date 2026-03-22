describe("apiRequest", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.resetModules();
    process.env.EXPO_PUBLIC_API_URL = "https://api.example.test";
    (global as typeof globalThis & { __DEV__: boolean }).__DEV__ = false;
    global.fetch = jest.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it("wysyła żądanie z JSON body i tokenem", async () => {
    const { apiRequest, API_URL } = require("@/api/api");

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ ok: true }),
    });

    await expect(
      apiRequest("/auth/login", "POST", { login: "demo" }, "secret")
    ).resolves.toEqual({ ok: true });

    expect(API_URL).toBe("https://api.example.test");
    expect(global.fetch).toHaveBeenCalledWith("https://api.example.test/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer secret",
      },
      body: JSON.stringify({ login: "demo" }),
    });
  });

  it("pomija body i Authorization gdy nie są podane", async () => {
    const { apiRequest } = require("@/api/api");

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ balance: 100 }),
    });

    await expect(apiRequest("/dashboard")).resolves.toEqual({ balance: 100 });
    expect(global.fetch).toHaveBeenCalledWith("https://api.example.test/dashboard", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: undefined,
    });
  });

  it("rzuca payload błędu gdy odpowiedź nie jest OK", async () => {
    const { apiRequest } = require("@/api/api");
    const errorPayload = { message: "Unauthorized" };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue(errorPayload),
    });

    await expect(apiRequest("/auth/login")).rejects.toEqual(errorPayload);
  });

  it("używa adresu developerskiego, gdy __DEV__ jest ustawione", () => {
    (global as typeof globalThis & { __DEV__: boolean }).__DEV__ = true;
    delete process.env.EXPO_PUBLIC_API_URL;
    jest.resetModules();

    const { API_URL } = require("@/api/api");
    expect(API_URL).toBe("http://192.67.197.185:3000");
  });
});
