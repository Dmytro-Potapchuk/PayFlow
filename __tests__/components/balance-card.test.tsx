import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

const toggleSensitiveData = jest.fn();

jest.mock("@/providers/AppProvider", () => ({
  useAppState: jest.fn(),
}));

import { useAppState } from "@/providers/AppProvider";
import BalanceCard from "@/components/BalanceCard";

describe("BalanceCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("maskuje dane gdy showSensitiveData jest false", () => {
    (useAppState as jest.Mock).mockReturnValue({
      showSensitiveData: false,
      toggleSensitiveData,
    });

    const { getByText } = render(
      <BalanceCard balance={123.45} balanceEur={10} balanceUsd={20} />
    );

    expect(getByText("••••••")).toBeTruthy();
    expect(getByText("EUR ••••")).toBeTruthy();
    expect(getByText("USD ••••")).toBeTruthy();
    expect(getByText("PayFlow •••• 4242")).toBeTruthy();

    fireEvent.press(getByText("eye-outline"));
    expect(toggleSensitiveData).toHaveBeenCalledTimes(1);
  });

  it("pokazuje pełne kwoty gdy showSensitiveData jest true", () => {
    (useAppState as jest.Mock).mockReturnValue({
      showSensitiveData: true,
      toggleSensitiveData,
    });

    const { getByText } = render(<BalanceCard balance={123.45} balanceEur={10} />);

    expect(getByText("123.45 PLN")).toBeTruthy();
    expect(getByText("EUR 10.00")).toBeTruthy();
    expect(getByText("PayFlow 1234 5678 9012 4242")).toBeTruthy();
    expect(getByText("Pełne dane są widoczne tylko tymczasowo")).toBeTruthy();
  });

  it("nie renderuje sekcji walut obcych bez sald pomocniczych", () => {
    (useAppState as jest.Mock).mockReturnValue({
      showSensitiveData: true,
      toggleSensitiveData,
    });

    const { queryByText } = render(<BalanceCard balance={50} />);

    expect(queryByText(/EUR /)).toBeNull();
    expect(queryByText(/USD /)).toBeNull();
  });
});
