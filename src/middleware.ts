import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// NOTE: Kept on the legacy `middleware` convention (not Next 16 `proxy`) on
// purpose — `proxy` only runs on the Node.js runtime, but the Cloudflare Pages
// adapter (@cloudflare/next-on-pages) requires the Edge runtime, which the
// `middleware` convention defaults to. Refreshes the Supabase session each
// request (no-op in demo mode).
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Run on everything except static assets and image files.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
