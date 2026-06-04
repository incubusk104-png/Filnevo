// LOCK 1: The Compute Guard (edge gateway).
//
// Next.js 16 renamed the `middleware` file convention to `proxy`. This file wires
// the rate limiter + payload-size guard in src/lib/rate-limit.ts so it actually
// runs at the network edge in front of the protected API routes. Without it, the
// rate-limit logic exists but never executes.
export { middleware as proxy } from "@/lib/rate-limit";

// `config` must be statically declared in this file (Next.js parses the matcher
// at compile time, so it cannot be re-exported from another module).
export const config = {
  matcher: [
    "/api/process-document",
    "/api/workspaces",
    "/api/ledger/:path*",
    "/api/audit/export",
    "/api/webhooks",
    "/api/an-token",
    "/api/quota",
  ],
};
