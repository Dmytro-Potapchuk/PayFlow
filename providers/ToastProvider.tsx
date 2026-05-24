import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import type { MessageType } from "@/types/message";

import type { Toast } from "./types";

type ToastContextValue = {
    toasts: Toast[];
    showToast: (title: string, message: string, type?: MessageType) => void;
    dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const dismissToast = useCallback((id: string) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback(
        (title: string, message: string, type: MessageType = "info") => {
            const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            setToasts((current) =>
                [...current, { id, title, message, type }].slice(-3)
            );
        },
        []
    );

    const value = useMemo<ToastContextValue>(
        () => ({
            toasts,
            showToast,
            dismissToast,
        }),
        [dismissToast, showToast, toasts]
    );

    return (
        <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
    );
}

export function useToastContext(): ToastContextValue {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error("useToastContext must be used within ToastProvider");
    }

    return context;
}
