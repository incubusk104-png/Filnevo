import type { ReactNode } from "react";
import { BRAND } from "@/constants";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface BaseLayoutProps {
    children: ReactNode;
    preview?: string;
}

function Tailwind({ children }: { children: ReactNode }) {
    return <>{children}</>;
}

export function BaseLayout({
    children,
    preview = `A secure update from ${BRAND.name}`,
}: BaseLayoutProps) {
    return (
        <Tailwind>
            <div style={{ display: "none", maxHeight: 0, overflow: "hidden" }}>
                {preview}
            </div>
            <table
                role="presentation"
                width="100%"
                cellPadding="0"
                cellSpacing="0"
                style={{ margin: 0, padding: 0, backgroundColor: "#0a0e17" }}
            >
                <tbody>
                    <tr>
                        <td align="center" style={{ padding: "32px 16px" }}>
                            <table
                                role="presentation"
                                width="100%"
                                cellPadding="0"
                                cellSpacing="0"
                                style={{
                                    maxWidth: "520px",
                                    backgroundColor: "#0f1420",
                                    border: "1px solid #1e293b",
                                    borderRadius: "18px",
                                    overflow: "hidden",
                                }}
                            >
                                <tbody>
                                    <Header />
                                    {children}
                                    <Footer />
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
        </Tailwind>
    );
}

export default BaseLayout;
