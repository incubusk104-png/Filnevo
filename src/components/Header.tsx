import { BRAND } from "@/constants";

export function Header() {
    return (
        <tr>
            <td style={{ padding: "28px 32px 8px 32px" }}>
                <img
                    src={BRAND.logoUrl}
                    width="140"
                    alt={BRAND.name}
                    style={{
                        display: "block",
                        border: 0,
                        outline: "none",
                        textDecoration: "none",
                        maxWidth: "140px",
                        height: "auto",
                    }}
                />
                <p
                    style={{
                        margin: "16px 0 0 0",
                        fontFamily:
                            "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.28em",
                        textTransform: "uppercase",
                        color: "#64748b",
                    }}
                >
                    Precision Metrics
                </p>
            </td>
        </tr>
    );
}
