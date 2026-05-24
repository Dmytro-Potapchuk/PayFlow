import type { ReactNode } from "react";
import { ScrollViewStyleReset } from "expo-router/html";

import { collectApiOrigins } from "@/constants/apiConfig";
import { theme } from "@/constants/theme";

function resolveConnectSrc(): string {
    const origins = new Set<string>(["'self'", ...collectApiOrigins()]);

    origins.add("https://secure.snd.payu.com");
    origins.add("wss:");
    origins.add("ws:");

    return Array.from(origins).join(" ");
}

function buildContentSecurityPolicy(): string {
    const connectSrc = resolveConnectSrc();

    const policies = [
        "default-src 'self'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'self'",
        "object-src 'none'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https:",
        "font-src 'self' data:",
        `connect-src ${connectSrc}`,
        "frame-src https://secure.snd.payu.com",
    ];

    if (!__DEV__) {
        policies.push("upgrade-insecure-requests");
    }

    return policies.join("; ");
}

export default function RootHtml({
    children,
}: {
    children: ReactNode;
}) {
    const contentSecurityPolicy = buildContentSecurityPolicy();

    return (
        <html lang="pl">
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, viewport-fit=cover"
                />
                <meta
                    httpEquiv="Content-Security-Policy"
                    content={contentSecurityPolicy}
                />
                <meta name="theme-color" content={theme.colors.primary} />
                <meta
                    name="description"
                    content="PayFlow Demo - testowa aplikacja demonstracyjna instalowalna na iPhone jako PWA."
                />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="default"
                />
                <meta name="apple-mobile-web-app-title" content="PayFlow Demo" />
                <link rel="icon" href="/assets/images/favicon.png" />
                <link rel="apple-touch-icon" href="/assets/images/icon.png" />
                <ScrollViewStyleReset />
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                            html, body {
                                margin: 0;
                                padding: 0;
                                background: ${theme.colors.background};
                            }
                            body {
                                overscroll-behavior-y: contain;
                                -webkit-tap-highlight-color: transparent;
                                -webkit-touch-callout: none;
                            }
                        `,
                    }}
                />
            </head>
            <body>{children}</body>
        </html>
    );
}
