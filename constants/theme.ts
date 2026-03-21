/**
 * PayFlow – design system (banking app style)
 */
export const theme = {
    colors: {
        primary: "#0d47a1",
        primaryLight: "#1565c0",
        primaryDark: "#0a3d7a",
        accent: "#00897b",
        accentLight: "#26a69a",
        success: "#2e7d32",
        error: "#c62828",
        info: "#546e7a",
        warning: "#f9a825",
        background: "#f5f7fa",
        surface: "#ffffff",
        surfaceElevated: "#ffffff",
        text: "#1a237e",
        textSecondary: "#5c6bc0",
        textMuted: "#7986cb",
        border: "#e8eaf6",
        borderLight: "#c5cae9",
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
    },
    radius: {
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        full: 9999,
    },
    typography: {
        h1: { fontSize: 28, fontWeight: "700" as const },
        h2: { fontSize: 22, fontWeight: "600" as const },
        h3: { fontSize: 18, fontWeight: "600" as const },
        body: { fontSize: 16 },
        bodySmall: { fontSize: 14 },
        caption: { fontSize: 12 },
    },
    shadows: {
        sm: {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 2,
        },
        md: {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
        },
        lg: {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 12,
            elevation: 8,
        },
    },
} as const;
