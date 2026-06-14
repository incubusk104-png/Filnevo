// Branded "your plan is active" email sent after a successful checkout.
import { TIERS } from "@/lib/tiers";
import type { SubscriptionTier } from "@/lib/ai/providers";

export interface CheckoutEmailArgs {
  tier: SubscriptionTier;
  amountPhp?: number;
  periodEnd: string;
  displayName?: string | null;
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

function groupThousands(value: number): string {
  const sign = value < 0 ? "-" : "";
  const digits = Math.abs(Math.round(value)).toString();
  return sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatPhp(amount: number): string {
  return `\u20b1${groupThousands(amount)}`;
}

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
    <td align="center" style="padding:48px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#0f1420;border:1px solid #1e293b;border-radius:24px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.4);">
        <tr>
          <td align="center" style="padding:40px 32px 0 32px;">
            <img src="${appUrl}/email-logo.svg" width="160" alt="Filnevo" style="display:inline-block;border:0;outline:none;text-decoration:none;height:auto;" />
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:32px 32px 0 32px;">
            <h1 style="margin:0;font-family:'Bricolage Grotesque', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;font-size:24px;font-weight:700;color:#e6e9f0;letter-spacing:-0.02em;">
              Your ${planLabel} plan is active
            </h1>
            <p style="margin:12px 0 0 0;font-family:'Hanken Grotesk', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;font-size:15px;line-height:1.6;color:#94a3b8;">
              ${greeting} thanks for upgrading — your payment was received and your account is now on <strong style="color:#e6e9f0;">${planLabel}</strong>.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 32px 16px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0e17;border:1px solid #1e293b;border-radius:16px;">
              <tr>
                <td style="padding:16px 20px;font-family:'Hanken Grotesk', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;font-size:13px;color:#94a3b8;">Plan</td>
                <td align="right" style="padding:16px 20px;font-family:'Space Grotesk', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;font-size:13px;font-weight:600;color:#e6e9f0;">${planLabel}</td>
              </tr>
              <tr>
                <td style="padding:0 20px 16px 20px;font-family:'Hanken Grotesk', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;font-size:13px;color:#94a3b8;">Amount paid</td>
                <td align="right" style="padding:0 20px 16px 20px;font-family:'Space Grotesk', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;font-size:13px;font-weight:600;color:#34d399;">${formatPhp(amount)}</td>
              </tr>
              ${renews ? `<tr>
                <td style="padding:0 20px 16px 20px;font-family:'Hanken Grotesk', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;font-size:13px;color:#94a3b8;">Renews / valid until</td>
                <td align="right" style="padding:0 20px 16px 20px;font-family:'Space Grotesk', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;font-size:13px;font-weight:600;color:#e6e9f0;">${renews}</td>
              </tr>` : ""}
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:16px 32px 8px 32px;">
            <a href="${appUrl}/dashboard" style="display:inline-block;background-color:#3b82f6;color:#ffffff;font-family:'Hanken Grotesk', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;font-size:14px;font-weight:600;text-decoration:none;padding:14px 28px;border-radius:12px;">
              Go to your dashboard
            </a>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:40px 32px;border-top:1px solid #1e293b;margin-top:32px;">
            <p style="margin:0;font-family:'Hanken Grotesk', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;font-size:12px;line-height:1.6;color:#475569;">
              This is your payment confirmation. If you didn&rsquo;t make this purchase, contact support right away.
            </p>
            <p style="margin:20px 0 0 0;font-family:'Bricolage Grotesque', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;font-size:14px;font-weight:700;color:#e6e9f0;letter-spacing:-0.02em;">
              &copy; 2026 <span style="color:#3b82f6;">Filnevo</span>
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:16px;">
              <tr>
                <td style="padding:0 10px;">
                  <a href="https://facebook.com/filnevo" style="text-decoration:none;">
                    <img src="https://img.icons8.com/material-rounded/24/3b82f6/facebook-new.png" width="20" height="20" alt="Facebook" style="display:block;border:0;" />
                  </a>
                </td>
                <td style="padding:0 10px;">
                  <a href="https://instagram.com/filnevo" style="text-decoration:none;">
                    <img src="https://img.icons8.com/material-rounded/24/06b6d4/instagram-new.png" width="20" height="20" alt="Instagram" style="display:block;border:0;" />
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`.trim();

  return { subject, html };
}
