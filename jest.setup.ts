(global as typeof globalThis & { __DEV__: boolean }).__DEV__ = false;

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");

  return {
    Ionicons: ({ name, ...props }: { name: string }) =>
      React.createElement(Text, props, name),
  };
});

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  Stack: {
    Screen: () => null,
  },
  Tabs: {
    Screen: () => null,
  },
  useLocalSearchParams: jest.fn(() => ({})),
}));
