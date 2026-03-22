module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["**/__tests__/**/*.test.ts?(x)"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  collectCoverageFrom: [
    "api/**/*.ts",
    "app/auth/login.tsx",
    "app/auth/register.tsx",
    "components/AppButton.tsx",
    "components/AppInput.tsx",
    "components/AppTabBar.tsx",
    "components/BalanceCard.tsx",
    "components/PwaInstallNotice.tsx",
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
