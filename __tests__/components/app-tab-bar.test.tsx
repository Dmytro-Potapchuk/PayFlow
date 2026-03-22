import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

jest.mock("@/providers/AppProvider", () => ({
  useAppState: jest.fn(),
}));

import { useAppState } from "@/providers/AppProvider";
import AppTabBar from "@/components/AppTabBar";

function createProps(activeRouteName: string) {
  const routes = [
    { key: "index", name: "index" },
    { key: "transfer", name: "transfer" },
    { key: "payu", name: "payu" },
    { key: "messages", name: "messages" },
    { key: "history", name: "history" },
    { key: "currency", name: "currency" },
    { key: "profile", name: "profile" },
    { key: "admin", name: "admin" },
  ];

  return {
    state: {
      key: "tab-state",
      type: "tab",
      stale: false,
      history: [],
      routeNames: routes.map((route) => route.name),
      routes,
      index: routes.findIndex((route) => route.name === activeRouteName),
    },
    navigation: {
      navigate: jest.fn(),
    },
    descriptors: {},
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  } as never;
}

describe("AppTabBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderuje główne zakładki i badge wiadomości", () => {
    (useAppState as jest.Mock).mockReturnValue({
      profile: { role: "user" },
      unreadMessages: 12,
    });

    const props = createProps("messages");
    const { getByText, queryByText } = render(<AppTabBar {...props} />);

    expect(getByText("Start")).toBeTruthy();
    expect(getByText("Przelew")).toBeTruthy();
    expect(getByText("Doładuj")).toBeTruthy();
    expect(getByText("Wiadomości")).toBeTruthy();
    expect(getByText("9+")).toBeTruthy();

    fireEvent.press(getByText("Więcej"));
    expect(getByText("Historia")).toBeTruthy();
    expect(getByText("Waluty")).toBeTruthy();
    expect(getByText("Profil")).toBeTruthy();
    expect(queryByText("Admin")).toBeNull();
  });

  it("pozwala adminowi wejść do dodatkowej zakładki", () => {
    (useAppState as jest.Mock).mockReturnValue({
      profile: { role: "admin" },
      unreadMessages: 1,
    });

    const props = createProps("history");
    const { getByText } = render(<AppTabBar {...props} />);

    fireEvent.press(getByText("Więcej"));
    fireEvent.press(getByText("Admin"));

    expect(props.navigation.navigate).toHaveBeenCalledWith("admin");
  });

  it("obsługuje brak jednej z głównych tras oraz zamknięcie menu", () => {
    (useAppState as jest.Mock).mockReturnValue({
      profile: { role: "user" },
      unreadMessages: 0,
    });

    const props = createProps("profile");
    props.state.routes = props.state.routes.filter(
      (route: { name: string }) => route.name !== "payu"
    );
    props.state.routeNames = props.state.routes.map(
      (route: { name: string }) => route.name
    );
    props.state.index = props.state.routes.findIndex(
      (route: { name: string }) => route.name === "profile"
    );

    const { getByText, queryByText } = render(<AppTabBar {...props} />);

    expect(queryByText("Doładuj")).toBeNull();
    fireEvent.press(getByText("Start"));
    expect(props.navigation.navigate).toHaveBeenCalledWith("index");

    fireEvent.press(getByText("Więcej"));
    expect(getByText("Więcej funkcji")).toBeTruthy();
    fireEvent.press(getByText("Szybki dostęp do pozostałych modułów"));
    expect(queryByText("Więcej funkcji")).toBeNull();
  });
});
