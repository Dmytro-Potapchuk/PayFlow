import React from "react";
import { Animated } from "react-native";
import { act, fireEvent, render } from "@testing-library/react-native";

jest.mock("@/providers/AppProvider", () => ({
  useProfile: jest.fn(),
  useMessages: jest.fn(),
}));

import { useMessages, useProfile } from "@/providers/AppProvider";
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
    (useProfile as jest.Mock).mockReturnValue({
      profile: { role: "user" },
    });
    (useMessages as jest.Mock).mockReturnValue({
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
    (useProfile as jest.Mock).mockReturnValue({
      profile: { role: "admin" },
    });
    (useMessages as jest.Mock).mockReturnValue({
      unreadMessages: 1,
    });

    const props = createProps("history");
    const { getByText } = render(<AppTabBar {...props} />);

    fireEvent.press(getByText("Więcej"));
    fireEvent.press(getByText("Admin"));

    expect(props.navigation.navigate).toHaveBeenCalledWith("admin");
  });

  it("obsługuje brak jednej z głównych tras oraz zamknięcie menu", async () => {
    jest
      .spyOn(Animated, "timing")
      .mockImplementation((value, config) => ({
        start: (callback?: (result: { finished: boolean }) => void) => {
          value.setValue(config.toValue as number);
          callback?.({ finished: true });
        },
        stop: jest.fn(),
        reset: jest.fn(),
      }));

    jest.useFakeTimers();
    (useProfile as jest.Mock).mockReturnValue({
      profile: { role: "user" },
    });
    (useMessages as jest.Mock).mockReturnValue({
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

    const { getByTestId, getByText, queryByText } = render(<AppTabBar {...props} />);

    expect(queryByText("Doładuj")).toBeNull();
    fireEvent.press(getByText("Start"));
    expect(props.navigation.navigate).toHaveBeenCalledWith("index");

    fireEvent.press(getByText("Więcej"));
    expect(getByText("Więcej funkcji")).toBeTruthy();
    fireEvent.press(getByTestId("app-tabbar-menu-backdrop"));
    expect(queryByText("Więcej funkcji")).toBeNull();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });
});
