import { BRAND } from "@/constants";

export function Footer() {
    return (
        <tr>
            <td
                style={{
                    padding: "24px 32px 28px 32px",
                    borderTop: "1px solid #1e293b",
                }}
            >
                <p
                    style={{
                        margin: 0,
                        fontFamily:
                            "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                        fontSize: "12px",
                        lineHeight: "1.65",
                        color: "#64748b",
                    }}
                >
                    Need help? Contact{" "}
                    <a
                        href={`mailto:${BRAND.supportEmail}`}
                        style={{ color: "#67e8f9", textDecoration: "none" }}
                    >
                        {BRAND.supportEmail}
                    </a>
                    .
                </p>
                <p
                    style={{
                        margin: "12px 0 0 0",
                        fontFamily:
                            "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                        fontSize: "11px",
                        color: "#475569",
                    }}
                >
                    © {new Date().getUTCFullYear()} {BRAND.name}. You received
                    this email because a transaction was recorded on your
                    account.
                </p>
            </td>
        </tr>
    );
}
