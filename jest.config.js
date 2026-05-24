module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["**/__tests__/**/*.test.ts?(x)"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^expo-secure-store$": "<rootDir>/__mocks__/expo-secure-store.ts",
  },
  collectCoverageFrom: [
    "api/**/*.ts",
    "app/auth/login.tsx",
    "app/auth/register.tsx",
    "components/AppButton.tsx",
    "components/AppInput.tsx",
    "components/AppTabBar.tsx",
    "components/BalanceCard.tsx",
    "components/IosHomeScreenNotice.tsx",
    "components/ToastHost.tsx",
    "constants/keyboard.ts",
    "utils/**/*.ts",
    "!**/*.d.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
};
