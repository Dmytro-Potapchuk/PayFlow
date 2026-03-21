import type { ReactNode } from "react";
import { ScrollViewStyleReset } from "expo-router/html";

export default function RootHtml({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <html lang="pl">
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, viewport-fit=cover"
                />
                <meta name="theme-color" content="#0d47a1" />
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
                                background: #f5f7fa;
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
