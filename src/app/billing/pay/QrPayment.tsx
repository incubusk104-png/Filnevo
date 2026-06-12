"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SubscriptionTier } from "@/lib/ai/providers";
import { TIERS, type BillingPeriod } from "@/lib/tiers";
import { Turnstile } from "@/components/captcha/Turnstile";

interface QrPaymentProps {
    tier: SubscriptionTier;
    label: string;
    seats?: number;
    period?: BillingPeriod;
}

interface QrData {
    demo: boolean;
    paymentIntentId: string;
    qrImageUrl: string;
    amount: number;
    expiresAt: string;
}

function formatCountdown(msLeft: number): string {
    if (msLeft <= 0) return "0:00";
    const total = Math.floor(msLeft / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}

// Renders a PayMongo QR Ph code, a download button, a GCash/Maya pay-by-QR
// guide, and polls payment status until the customer has paid (then redirects
// to the success page). The actual plan upgrade is applied server-side.
export function QrPayment({
    tier,
    label,
    seats,
    period = "monthly",
}: QrPaymentProps) {
    const isTeam = TIERS[tier].seatsExpandable;
    const periodSuffix = period === "annual" ? "/ year" : "/ month";
    const [data, setData] = useState<QrData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [paid, setPaid] = useState(false);
    const [expired, setExpired] = useState(false);
    const [now, setNow] = useState(() => Date.now());
    // Bumping this key remounts the Turnstile widget to force a fresh, single-use
    // token (e.g. when regenerating an expired QR or retrying after an error).
    const [captchaKey, setCaptchaKey] = useState(0);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const generate = useCallback(
        async (captchaToken: string) => {
            setError(null);
            setExpired(false);
            setData(null);
            try {
                const res = await fetch("/api/billing/qrph", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        tier,
                        seats,
                        period,
                        captcha_token: captchaToken,
                    }),
                });
                if (res.status === 401) {
                    const nextQs = new URLSearchParams({ tier, period });
                    if (seats !== undefined) nextQs.set("seats", String(seats));
                    const next = `/billing/pay?${nextQs.toString()}`;
                    window.location.href = `/login?mode=signin&next=${encodeURIComponent(next)}`;
                    return;
                }
                const json = (await res.json()) as {
                    ok?: boolean;
                    demo?: boolean;
                    error?: string;
                    payment_intent_id?: string;
                    qr_image_url?: string;
                    amount?: number;
                    expires_at?: string;
                };
                if (json.ok && json.qr_image_url && json.payment_intent_id) {
                    setData({
                        demo: !!json.demo,
                        paymentIntentId: json.payment_intent_id,
                        qrImageUrl: json.qr_image_url,
                        amount: json.amount ?? 0,
                        expiresAt:
                            json.expires_at ??
                            new Date(Date.now() + 30 * 60_000).toISOString(),
                    });
                } else if (json.error === "captcha_failed") {
                    setError(
                        "Verification failed. Please complete the check and try again.",
                    );
                } else {
                    setError(
                        "We couldn't generate a QR code. Please try again.",
                    );
                }
            } catch {
                setError("We couldn't generate a QR code. Please try again.");
            }
        },
        [tier, seats, period],
    );

    // A solved captcha token gates QR generation: as soon as the widget verifies
    // (instantly in demo mode), generate the QR with that single-use token.
    const handleCaptcha = useCallback(
        (token: string) => {
            void generate(token);
        },
        [generate],
    );

    // Reset the widget (new challenge → new token) and clear the current QR so a
    // fresh generation runs once the new token arrives.
    const regenerate = useCallback(() => {
        setData(null);
        setError(null);
        setExpired(false);
        setCaptchaKey((k) => k + 1);
    }, []);

    // Tick the countdown clock every second.
    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(t);
    }, []);

    // Poll payment status while a (non-demo) QR is active and unpaid.
    useEffect(() => {
        if (!data || paid || expired || data.demo) return;
        const id = data.paymentIntentId;

        async function poll() {
            try {
                const res = await fetch(
                    `/api/billing/qrph/status?id=${encodeURIComponent(id)}`,
                );
                const json = (await res.json()) as { paid?: boolean };
                if (json.paid) {
                    setPaid(true);
                    const successQs = new URLSearchParams({ tier });
                    if (seats !== undefined)
                        successQs.set("seats", String(seats));
                    successQs.set("period", period);
                    window.location.href = `/billing/success?${successQs.toString()}`;
                }
            } catch {
                /* transient — keep polling */
            }
        }

        pollRef.current = setInterval(poll, 4000);
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [data, paid, expired, tier, seats, period]);

    // Flip to expired when the countdown runs out.
    const msLeft = data ? new Date(data.expiresAt).getTime() - now : 0;
    useEffect(() => {
        if (data && !data.demo && !paid && msLeft <= 0) setExpired(true);
    }, [data, paid, msLeft]);

    return (
        <div className="data-card border border-hairline p-6 sm:p-8">
            <div className="text-center">
                <span className="eyebrow">QR Ph payment</span>
                <h1 className="mt-3 font-heading text-2xl font-bold text-foreground">
                    Pay for {label}
                </h1>
                {isTeam && seats !== undefined && (
                    <p className="mt-1 text-sm text-text-muted">
                        {seats} seats ·{" "}
                        {period === "annual" ? "Annual" : "Monthly"} billing
                    </p>
                )}
                {data && (
                    <p className="mt-1 font-metrics text-lg text-insight-cyan">
                        ₱{data.amount.toLocaleString()}{" "}
                        <span className="text-sm text-text-muted">
                            {periodSuffix}
                        </span>
                    </p>
                )}
            </div>

            {/* QR + status */}
            <div className="mt-6 flex flex-col items-center">
                {error && (
                    <div className="w-full rounded-md border border-alert-red/30 bg-alert-red/10 p-4 text-center text-sm text-alert-red">
                        {error}
                        <button
                            onClick={regenerate}
                            className="btn-anim press-effect mt-3 block w-full rounded-md bg-velocity-blue px-4 py-2.5 text-sm font-medium text-neutral-50 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-velocity-blue/90 hover:shadow-lg hover:shadow-velocity-blue/30"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {!error && !data && (
                    <div className="flex w-full flex-col items-center gap-4">
                        <Turnstile
                            resetKey={captchaKey}
                            action="qrph-generate"
                            onVerify={handleCaptcha}
                            className="flex justify-center"
                        />
                        <p className="text-center text-xs text-text-muted">
                            Complete the verification above to generate your QR
                            Ph code.
                        </p>
                    </div>
                )}

                {!error && data && (
                    <>
                        <div className="relative rounded-xl border border-hairline bg-white p-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={data.qrImageUrl}
                                alt={`QR Ph code to pay for ${label}`}
                                width={240}
                                height={240}
                                className={expired || paid ? "opacity-20" : ""}
                            />
                            {(expired || paid) && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="rounded-md bg-neutral-950/80 px-3 py-1 text-sm font-medium text-foreground">
                                        {paid ? "Paid ✓" : "QR expired"}
                                    </span>
                                </div>
                            )}
                        </div>

                        {data.demo && (
                            <p className="mt-3 text-xs text-warning-amber">
                                Demo mode — PayMongo isn&apos;t configured, so
                                this QR is a placeholder.
                            </p>
                        )}

                        {!data.demo && !expired && !paid && (
                            <p className="mt-3 text-xs text-text-muted">
                                Expires in{" "}
                                <span className="font-metrics text-foreground">
                                    {formatCountdown(msLeft)}
                                </span>{" "}
                                · waiting for payment…
                            </p>
                        )}

                        {expired && (
                            <button
                                onClick={regenerate}
                                className="btn-anim press-effect mt-3 rounded-md bg-velocity-blue px-4 py-2.5 text-sm font-medium text-neutral-50 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-velocity-blue/90 hover:shadow-lg hover:shadow-velocity-blue/30"
                            >
                                Generate a new QR
                            </button>
                        )}

                        {/* Download */}
                        <a
                            href={data.qrImageUrl}
                            download={`filnevo-${tier}-qrph.png`}
                            className="btn-anim press-effect group mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-neutral-700 bg-neutral-900/30 px-4 py-2.5 text-sm font-medium text-neutral-100 transition-all duration-200 hover:-translate-y-0.5 hover:border-velocity-blue/50 hover:bg-neutral-800/40 hover:shadow-md hover:shadow-black/30"
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="transition-transform duration-200 group-hover:translate-y-0.5"
                            >
                                <path
                                    d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            Download QR image
                        </a>
                    </>
                )}
            </div>

            {/* Guide */}
            <div className="mt-8 rounded-lg border border-hairline bg-neutral-900/30 p-5">
                <h2 className="font-metrics text-sm font-semibold text-foreground">
                    How to pay with GCash or Maya
                </h2>
                <ol className="mt-3 space-y-2.5 text-sm text-text-muted">
                    <li className="flex gap-3">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-velocity-blue/15 font-metrics text-xs text-velocity-blue">
                            1
                        </span>
                        <span>
                            Tap{" "}
                            <strong className="text-foreground">
                                Download QR image
                            </strong>{" "}
                            to save the code to your phone.
                        </span>
                    </li>
                    <li className="flex gap-3">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-velocity-blue/15 font-metrics text-xs text-velocity-blue">
                            2
                        </span>
                        <span>
                            Open{" "}
                            <strong className="text-foreground">GCash</strong> →
                            tap{" "}
                            <strong className="text-foreground">Scan QR</strong>{" "}
                            →{" "}
                            <strong className="text-foreground">
                                Upload from gallery
                            </strong>{" "}
                            and pick the saved QR. (In{" "}
                            <strong className="text-foreground">Maya</strong>:{" "}
                            <strong className="text-foreground">Scan</strong> →
                            upload the image.)
                        </span>
                    </li>
                    <li className="flex gap-3">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-velocity-blue/15 font-metrics text-xs text-velocity-blue">
                            3
                        </span>
                        <span>
                            The amount is already encoded — just review it and
                            tap <strong className="text-foreground">Pay</strong>
                            .
                        </span>
                    </li>
                    <li className="flex gap-3">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-efficiency-green/15 font-metrics text-xs text-efficiency-green">
                            4
                        </span>
                        <span>
                            Keep this page open — your plan activates{" "}
                            <strong className="text-foreground">
                                automatically
                            </strong>{" "}
                            the moment payment is confirmed.
                        </span>
                    </li>
                </ol>
                <p className="mt-4 text-xs text-text-muted">
                    You can also scan the QR directly with any InstaPay-enabled
                    bank or e-wallet app instead of uploading it.
                </p>
            </div>
        </div>
    );
}
