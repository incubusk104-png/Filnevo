"use client";

import { useCallback, useEffect, useRef } from "react";
import { ShieldAlert } from "lucide-react";

// Reusable Cloudflare Turnstile CAPTCHA widget — the client half of the shared
// verification "template". Drop it into any form (it injects a
// `cf-turnstile-response` field for server actions) or read the token in JS via
// the `onVerify` callback for fetch-based flows.
//
// Verification is always real. If `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is missing
// (e.g. not set as a build-time env var in Cloudflare Pages) the widget can't
// render, so we surface a clear error and emit no token — the gated flow stays
// locked rather than silently auto-approving.

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileRenderOptions {
  sitekey: string;
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
  action?: string;
  theme?: "auto" | "light" | "dark";
}

interface TurnstileApi {
  render: (el: HTMLElement, opts: TurnstileRenderOptions) => string;
  reset: (id?: string) => void;
  remove: (id: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

// Load the Turnstile script once per page and resolve when the API is ready.
let scriptPromise: Promise<void> | null = null;
function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no_window"));
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const waitForApi = () => {
      if (window.turnstile) return resolve();
      setTimeout(waitForApi, 50);
    };
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src^="https://challenges.cloudflare.com/turnstile"]',
    );
    if (existing) {
      existing.addEventListener("load", waitForApi);
      waitForApi();
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = waitForApi;
    script.onerror = () => reject(new Error("turnstile_script_failed"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export interface TurnstileProps {
  /** Called with the verification token once the challenge is solved. */
  onVerify?: (token: string) => void;
  /** Called when the token expires or the challenge errors out. */
  onExpire?: () => void;
  /** Optional Turnstile action label (shows up in Cloudflare analytics). */
  action?: string;
  theme?: "auto" | "light" | "dark";
  className?: string;
}

export function Turnstile({
  onVerify,
  onExpire,
  action,
  theme = "auto",
  className,
}: TurnstileProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const missingKey = !SITE_KEY;

  const handleVerify = useCallback(
    (token: string) => onVerify?.(token),
    [onVerify],
  );
  const handleExpire = useCallback(() => onExpire?.(), [onExpire]);

  useEffect(() => {
    if (missingKey) return; // nothing to render without a site key

    let cancelled = false;
    loadTurnstileScript()
      .then(() => {
        if (cancelled || !hostRef.current || !window.turnstile) return;
        if (widgetId.current) return; // guard against double render
        widgetId.current = window.turnstile.render(hostRef.current, {
          sitekey: SITE_KEY as string,
          action,
          theme,
          callback: handleVerify,
          "expired-callback": handleExpire,
          "error-callback": handleExpire,
        });
      })
      .catch(() => {
        /* script blocked — leave the flow gated (no token emitted) */
      });

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {
          /* widget already gone */
        }
        widgetId.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missingKey]);

  if (missingKey) {
    return (
      <div className={className}>
        <div className="flex items-center gap-2 rounded-md border border-alert-red/40 bg-alert-red/10 px-3 py-2.5 font-body text-xs text-alert-red">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          Verification is temporarily unavailable. Please try again later.
        </div>
      </div>
    );
  }

  return <div ref={hostRef} className={className} />;
}
