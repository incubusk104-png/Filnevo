import { createClient } from "npm:@supabase/supabase-js@2.106.2";
import { Resend } from "npm:resend@4.0.1";
import { BRAND } from "../_shared/brand.ts";

type PurchaseStatus = "pending" | "completed" | "paid" | "failed" | "refunded";

interface PurchaseRecord {
    id: string;
    user_id: string;
    product_name?: string | null;
    amount?: number | string | null;
    currency?: string | null;
    status?: PurchaseStatus | string | null;
    provider?: string | null;
    provider_ref?: string | null;
    metadata?: Record<string, unknown> | null;
    created_at?: string | null;
}

interface DatabaseWebhookPayload<TRecord> {
    type?: string;
    table?: string;
    schema?: string;
    record?: TRecord;
    old_record?: TRecord | null;
}

interface ProfileData {
    email: string | null;
    fullName: string | null;
}

const json = (body: Record<string, unknown>, status = 200) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });

const requireEnv = (name: string): string => {
    const value = Deno.env.get(name);
    if (!value) throw new Error(`missing_env:${name}`);
    return value;
};

const escapeHtml = (value: string): string =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const formatMoney = (
    amount: number | string | null | undefined,
    currency = "PHP",
) => {
    const numeric = Number(amount ?? 0);
    const safeAmount = Number.isFinite(numeric) ? numeric : 0;

    try {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency,
            minimumFractionDigits: 2,
        }).format(safeAmount);
    } catch {
        return `${currency} ${safeAmount.toFixed(2)}`;
    }
};

const assertWebhookSecret = (req: Request) => {
    const expected = Deno.env.get("PURCHASE_WEBHOOK_SECRET");
    if (!expected) return;

    const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const explicit = req.headers.get("x-webhook-secret");
    if (bearer !== expected && explicit !== expected) {
        throw new Error("invalid_webhook_secret");
    }
};

async function fetchProfile(
    supabase: ReturnType<typeof createClient>,
    userId: string,
): Promise<ProfileData> {
    const profileResult = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", userId)
        .maybeSingle();

    if (!profileResult.error && profileResult.data) {
        return {
            email: profileResult.data.email ?? null,
            fullName: profileResult.data.full_name ?? null,
        };
    }

    const userProfileResult = await supabase
        .from("user_profiles")
        .select("email, display_name")
        .eq("id", userId)
        .maybeSingle();

    if (!userProfileResult.error && userProfileResult.data) {
        return {
            email: userProfileResult.data.email ?? null,
            fullName: userProfileResult.data.display_name ?? null,
        };
    }

    const authResult = await supabase.auth.admin.getUserById(userId);
    if (authResult.error || !authResult.data.user) {
        throw new Error(`profile_not_found:${userId}`);
    }

    const user = authResult.data.user;
    const metadata = user.user_metadata ?? {};
    return {
        email: user.email ?? null,
        fullName:
            typeof metadata.full_name === "string"
                ? metadata.full_name
                : typeof metadata.display_name === "string"
                  ? metadata.display_name
                  : null,
    };
}

function renderPurchaseEmail(args: {
    purchase: PurchaseRecord;
    fullName: string | null;
    appUrl: string;
}) {
    const { purchase, fullName, appUrl } = args;
    const productName = escapeHtml(
        purchase.product_name ?? "Filnevo subscription",
    );
    const amount = escapeHtml(
        formatMoney(purchase.amount, purchase.currency ?? "PHP"),
    );
    const firstName = fullName?.trim().split(/\s+/)[0];
    const greeting = firstName ? `Hi ${escapeHtml(firstName)},` : "Hi there,";
    const dashboardUrl = `${appUrl}/dashboard`;

    const subject = `Purchase confirmed — ${productName}`;
    const html = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0;padding:0;background-color:#0a0e17;">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#0f1420;border:1px solid #1e293b;border-radius:18px;overflow:hidden;">
        <tr>
          <td style="padding:28px 32px 8px 32px;">
            <img src="${escapeHtml(BRAND.logoUrl)}" width="140" alt="${escapeHtml(BRAND.name)}" style="display:block;border:0;outline:none;text-decoration:none;max-width:140px;height:auto;" />
            <p style="margin:16px 0 0 0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.28em;text-transform:uppercase;color:#64748b;">Precision Metrics</p>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 32px 0 32px;">
            <h1 style="margin:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:24px;line-height:1.25;font-weight:700;color:#e6e9f0;">Your purchase is confirmed</h1>
            <p style="margin:12px 0 0 0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.65;color:#94a3b8;">
              ${greeting} thanks for your purchase. We recorded the transaction and your ${escapeHtml(BRAND.name)} account has been updated.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px 8px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0e17;border:1px solid #1e293b;border-radius:14px;">
              <tr>
                <td style="padding:18px 20px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;color:#94a3b8;">Product</td>
                <td align="right" style="padding:18px 20px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;font-weight:700;color:#e6e9f0;">${productName}</td>
              </tr>
              <tr>
                <td style="padding:0 20px 18px 20px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;color:#94a3b8;">Amount</td>
                <td align="right" style="padding:0 20px 18px 20px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;font-weight:700;color:#34d399;">${amount}</td>
              </tr>
              <tr>
                <td style="padding:0 20px 18px 20px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;color:#94a3b8;">Reference</td>
                <td align="right" style="padding:0 20px 18px 20px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;color:#cbd5e1;">${escapeHtml(purchase.provider_ref ?? purchase.id)}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px 8px 32px;">
            <a href="${escapeHtml(dashboardUrl)}" style="display:inline-block;background-color:#2563eb;color:#ffffff;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;text-decoration:none;padding:12px 22px;border-radius:10px;">Open dashboard</a>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px 28px 32px;border-top:1px solid #1e293b;">
            <p style="margin:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.65;color:#64748b;">
              If you did not make this purchase, contact <a href="mailto:${escapeHtml(BRAND.supportEmail)}" style="color:#67e8f9;text-decoration:none;">${escapeHtml(BRAND.supportEmail)}</a> immediately.
            </p>
            <p style="margin:12px 0 0 0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11px;color:#475569;">© ${new Date().getUTCFullYear()} ${escapeHtml(BRAND.name)}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`.trim();

    return { subject, html };
}

Deno.serve(async (req) => {
    if (req.method !== "POST") {
        return json({ ok: false, error: "method_not_allowed" }, 405);
    }

    try {
        assertWebhookSecret(req);

        const resendApiKey = requireEnv("RESEND_API_KEY");
        const supabaseUrl = requireEnv("SUPABASE_URL");
        const supabaseServiceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
        const resendFrom =
            Deno.env.get("RESEND_FROM") ??
            `${BRAND.name} <noreply@filnevo.com>`;
        const appUrl = (
            Deno.env.get("APP_URL") ?? "https://filnevo.com"
        ).replace(/\/$/, "");

        const payload =
            (await req.json()) as DatabaseWebhookPayload<PurchaseRecord>;
        const purchase = payload.record;

        if (!purchase?.id || !purchase.user_id) {
            return json({ ok: false, error: "invalid_purchase_record" }, 400);
        }

        if (
            purchase.status &&
            !["completed", "paid"].includes(purchase.status)
        ) {
            return json(
                { ok: true, skipped: true, reason: "purchase_not_completed" },
                202,
            );
        }

        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
            auth: { persistSession: false, autoRefreshToken: false },
        });
        const resend = new Resend(resendApiKey);
        const profile = await fetchProfile(supabase, purchase.user_id);

        if (!profile.email) {
            return json({ ok: false, error: "profile_email_missing" }, 422);
        }

        const { subject, html } = renderPurchaseEmail({
            purchase,
            fullName: profile.fullName,
            appUrl,
        });

        const result = await resend.emails.send({
            from: resendFrom,
            to: profile.email,
            subject,
            html,
            replyTo: BRAND.supportEmail,
            tags: [
                { name: "event", value: "purchase_inserted" },
                { name: "purchase_id", value: purchase.id },
            ],
        });

        if (result.error) {
            console.error("resend_send_failed", result.error);
            return json({ ok: false, error: "email_send_failed" }, 502);
        }

        return json({ ok: true, emailId: result.data?.id ?? null });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "unknown_error";
        const status =
            message === "invalid_webhook_secret"
                ? 401
                : message.startsWith("missing_env:")
                  ? 500
                  : 500;
        console.error("handle_purchase_webhook_failed", message);
        return json({ ok: false, error: message }, status);
    }
});
