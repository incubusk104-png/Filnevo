"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";

// Reusable Cloudflare Turnstile CAPTCHA widget — the client half of the shared
// verification "template". Drop it into any form (it injects a
// `cf-turnstile-response` field for server actions) or read the token in JS via
// the `onVerify` callback for fetch-based flows.
//
// Verification is always real. While Cloudflare's script mounts the widget we
// show a quiet "Loading verification…" state; only a genuine failure (missing
// `NEXT_PUBLIC_TURNSTILE_SITE_KEY` at build time, or a blocked script) surfaces
// an error, and no token is emitted — so the gated flow stays locked rather
// than silently auto-approving.

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

  // "loading" while the Cloudflare script mounts the widget, "ready" once it
  // renders, "error" only on a genuine failure (missing key / script blocked).
  // This avoids flashing an alarming red box before the widget has a chance to
  // appear.
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    missingKey ? "error" : "loading",
  );

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
        if (!cancelled) setStatus("ready");
      })
      .catch(() => {
        // Script blocked / failed to load — leave the flow gated (no token).
        if (!cancelled) setStatus("error");
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

  return (
    <div className={className}>
      {/* The widget mounts here once Cloudflare's script renders it. */}
      <div ref={hostRef} className={status === "ready" ? "" : "hidden"} />

      {status === "loading" && (
        <div className="flex items-center gap-2 rounded-md border border-hairline bg-neutral-900/50 px-3 py-2.5 font-body text-xs text-text-muted">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-insight-cyan" />
          Loading verification…
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-2 rounded-md border border-warning-amber/40 bg-warning-amber/10 px-3 py-2.5 font-body text-xs text-warning-amber">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          Verification couldn&rsquo;t load. Please refresh and try again.
        </div>
      )}
    </div>
  );
}
