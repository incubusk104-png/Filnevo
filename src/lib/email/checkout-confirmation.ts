// Branded "your plan is active" email sent after a successful checkout.
//
// Mirrors the look of the Supabase auth templates in supabase/templates/* (dark
// "Precision Metrics" palette, hosted logo, table layout) so transactional mail
// is visually consistent. Pure render function — no I/O — so it's trivial to
// unit-test and runs on the Edge runtime.
import { TIERS } from "@/lib/tiers";
import type { SubscriptionTier } from "@/lib/ai/providers";

export interface CheckoutEmailArgs {
  tier: SubscriptionTier;
  /** Amount paid in PHP (whole pesos). Falls back to the tier's list price. */
  amountPhp?: number;
  /** ISO timestamp the granted billing period ends. */
  periodEnd: string;
  displayName?: string | null;
  /** App base URL (no trailing slash), used for the logo + dashboard link. */
  appUrl: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "12,345" — manual grouping so we don't depend on Intl on the Edge runtime. */
function groupThousands(value: number): string {
  const sign = value < 0 ? "-" : "";
  const digits = Math.abs(Math.round(value)).toString();
  return sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatPhp(amount: number): string {
  return `\u20b1${groupThousands(amount)}`;
}

/** "8 June 2026" from an ISO timestamp (UTC). Returns "" if unparseable. */
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function renderCheckoutConfirmationEmail(
  args: CheckoutEmailArgs,
): RenderedEmail {
  const { tier, amountPhp, periodEnd, displayName, appUrl } = args;
  const meta = TIERS[tier];
  const planLabel = meta?.label ?? tier;
  const amount = amountPhp ?? meta?.pricePhp ?? 0;
  const renews = formatDate(periodEnd);
  const greeting = displayName ? `Hi ${displayName},` : "Hi there,";
  const subject = `Payment received — your ${planLabel} plan is active`;

  const html = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0;padding:0;background-color:#0a0e17;">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#0f1420;border:1px solid #1e293b;border-radius:16px;overflow:hidden;">
        <tr>
          <td style="padding:28px 32px 8px 32px;">
            <img src="${appUrl}/email-logo.png" width="140" alt="Filnevo" style="display:block;border:0;outline:none;text-decoration:none;max-width:140px;height:auto;" />
          </td>
        </tr>
        <tr>
          <td style="padding:8px 32px 0 32px;">
            <h1 style="margin:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:22px;font-weight:700;color:#e6e9f0;">
              Your ${planLabel} plan is active
            </h1>
            <p style="margin:10px 0 0 0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#94a3b8;">
              ${greeting} thanks for upgrading — your payment was received and your account is now on <strong style="color:#e6e9f0;">${planLabel}</strong>.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px 8px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0e17;border:1px solid #1e293b;border-radius:12px;">
              <tr>
                <td style="padding:16px 20px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;color:#94a3b8;">Plan</td>
                <td align="right" style="padding:16px 20px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;color:#e6e9f0;">${planLabel}</td>
              </tr>
              <tr>
                <td style="padding:0 20px 16px 20px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;color:#94a3b8;">Amount paid</td>
                <td align="right" style="padding:0 20px 16px 20px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;color:#34d399;">${formatPhp(amount)}</td>
              </tr>
              ${renews ? `<tr>
                <td style="padding:0 20px 16px 20px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;color:#94a3b8;">Renews / valid until</td>
                <td align="right" style="padding:0 20px 16px 20px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;color:#e6e9f0;">${renews}</td>
              </tr>` : ""}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px 8px 32px;">
            <a href="${appUrl}/dashboard" style="display:inline-block;background-color:#3b82f6;color:#ffffff;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;text-decoration:none;padding:12px 22px;border-radius:10px;">
              Go to your dashboard
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px 28px 32px;border-top:1px solid #1e293b;">
            <p style="margin:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#64748b;">
              This is your payment confirmation. If you didn&rsquo;t make this purchase, contact support right away.
            </p>
            <p style="margin:12px 0 0 0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;color:#475569;">
              &copy; Filnevo
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`.trim();

  return { subject, html };
}
