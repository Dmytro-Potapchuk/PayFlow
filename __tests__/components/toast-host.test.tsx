import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

const dismissToast = jest.fn();

jest.mock("@/providers/AppProvider", () => ({
  useAppState: jest.fn(),
}));

import { useAppState } from "@/providers/AppProvider";
import ToastHost from "@/components/ToastHost";

describe("ToastHost", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("nie renderuje nic bez toastów", () => {
    (useAppState as jest.Mock).mockReturnValue({
      toasts: [],
      dismissToast,
    });

    const { toJSON } = render(<ToastHost />);
    expect(toJSON()).toBeNull();
  });

  it("renderuje toasty i zamyka wybrany element", () => {
    (useAppState as jest.Mock).mockReturnValue({
      toasts: [
        { id: "1", title: "OK", message: "Zapisano", type: "success" },
        { id: "2", title: "Błąd", message: "Nie wyszło", type: "error" },
        { id: "3", title: "Info", message: "Nowa wiadomość", type: "info" },
      ],
      dismissToast,
    });

    const { getAllByLabelText, getByText } = render(<ToastHost />);

    expect(getByText("OK")).toBeTruthy();
    expect(getByText("Błąd")).toBeTruthy();
    expect(getByText("Info")).toBeTruthy();
    expect(getByText("checkmark-circle")).toBeTruthy();
    expect(getByText("alert-circle")).toBeTruthy();
    expect(getByText("information-circle")).toBeTruthy();

    fireEvent.press(getAllByLabelText("Zamknij powiadomienie")[1]);
    expect(dismissToast).toHaveBeenCalledWith("2");
  });
});
