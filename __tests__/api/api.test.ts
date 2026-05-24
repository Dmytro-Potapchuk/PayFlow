describe("apiRequest", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.resetModules();
    process.env.EXPO_PUBLIC_API_URL = "https://api.example.test";
    delete process.env.EXPO_PUBLIC_DEV_API_URL;
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
      headers: { get: () => "application/json" },
      text: jest.fn().mockResolvedValue(JSON.stringify({ ok: true })),
    });

    await expect(
      apiRequest("/auth/login", "POST", { login: "demo" }, "secret")
    ).resolves.toEqual({ ok: true });

    expect(API_URL).toBe("https://api.example.test");
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.test/auth/login",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer secret",
        },
        body: JSON.stringify({ login: "demo" }),
        signal: expect.any(AbortSignal),
      })
    );
  });

  it("pomija body i Authorization gdy nie są podane", async () => {
    const { apiRequest } = require("@/api/api");

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      text: jest.fn().mockResolvedValue(JSON.stringify({ balance: 100 })),
    });

    await expect(apiRequest("/dashboard")).resolves.toEqual({ balance: 100 });
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.test/dashboard",
      expect.objectContaining({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: undefined,
      })
    );
  });

  it("rzuca ApiError gdy odpowiedź nie jest OK", async () => {
    const { apiRequest } = require("@/api/api");

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      headers: { get: () => "application/json" },
      text: jest
        .fn()
        .mockResolvedValue(JSON.stringify({ message: "Unauthorized" })),
    });

    await expect(apiRequest("/auth/login")).rejects.toMatchObject({
      name: "ApiError",
      message: "Unauthorized",
      status: 401,
    });
  });

  it("mapuje błąd sieci na ApiError", async () => {
    const { apiRequest } = require("@/api/api");

    (global.fetch as jest.Mock).mockRejectedValue(
      new TypeError("Network request failed")
    );

    await expect(apiRequest("/dashboard")).rejects.toMatchObject({
      name: "ApiError",
      code: "NETWORK",
    });
  });

  it("mapuje timeout na ApiError", async () => {
    const { apiRequest } = require("@/api/api");

    const abortError = new DOMException("Aborted", "AbortError");
    (global.fetch as jest.Mock).mockRejectedValue(abortError);

    await expect(apiRequest("/dashboard")).rejects.toMatchObject({
      name: "ApiError",
      code: "TIMEOUT",
    });
  });

  it("rzuca ApiError gdy odpowiedź nie jest JSON-em", async () => {
    const { apiRequest } = require("@/api/api");

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 502,
      headers: { get: () => "text/html" },
      text: jest.fn().mockResolvedValue("<html>Bad Gateway</html>"),
    });

    await expect(apiRequest("/dashboard")).rejects.toMatchObject({
      name: "ApiError",
      code: "INVALID_RESPONSE",
    });
  });

  it("używa adresu developerskiego z EXPO_PUBLIC_DEV_API_URL", () => {
    (global as typeof globalThis & { __DEV__: boolean }).__DEV__ = true;
    process.env.EXPO_PUBLIC_DEV_API_URL = "http://dev-api.local:3000";
    jest.resetModules();

    const { API_URL } = require("@/api/api");
    expect(API_URL).toBe("http://dev-api.local:3000");
  });

  it("domyślnie używa localhost w trybie developerskim", () => {
    (global as typeof globalThis & { __DEV__: boolean }).__DEV__ = true;
    delete process.env.EXPO_PUBLIC_DEV_API_URL;
    jest.resetModules();

    const { API_URL } = require("@/api/api");
    expect(API_URL).toBe("http://localhost:3000");
  });
});
