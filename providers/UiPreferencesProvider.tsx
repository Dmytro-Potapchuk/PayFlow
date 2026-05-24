import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";

type UiPreferencesContextValue = {
    showSensitiveData: boolean;
    toggleSensitiveData: () => void;
};

const UiPreferencesContext = createContext<UiPreferencesContextValue | undefined>(
    undefined
);

export function UiPreferencesProvider({ children }: { children: ReactNode }) {
    const [showSensitiveData, setShowSensitiveData] = useState(false);

    const toggleSensitiveData = useCallback(() => {
        setShowSensitiveData((current) => !current);
    }, []);

    const value = useMemo<UiPreferencesContextValue>(
        () => ({
            showSensitiveData,
            toggleSensitiveData,
        }),
        [showSensitiveData, toggleSensitiveData]
    );

    return (
        <UiPreferencesContext.Provider value={value}>
            {children}
        </UiPreferencesContext.Provider>
    );
}

export function useUiPreferencesContext(): UiPreferencesContextValue {
    const context = useContext(UiPreferencesContext);

    if (!context) {
        throw new Error(
            "useUiPreferencesContext must be used within UiPreferencesProvider"
        );
    }

    return context;
}
