import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/mode";
import { safeNextPath } from "@/lib/auth/next";

// Required by @cloudflare/next-on-pages: non-static routes run on Edge.
export const runtime = "edge";

// OAuth / email-confirmation callback. Supabase redirects here with a `code`
// that we exchange for a session (cookies are set by the ssr client), then we
// forward the user to `next` (defaults to the dashboard).
export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const next = safeNextPath(url.searchParams.get("next"));
    const origin = process.env.APP_URL?.replace(/\/$/, "") ?? url.origin;

    if (isDemoMode()) {
        return NextResponse.redirect(`${origin}${next}`);
    }

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user?.email_confirmed_at) {
                await supabase.auth.signOut();
                return NextResponse.redirect(
                    `${origin}/login?error=verification`,
                );
            }

            const { error: markerError } = await supabase
                .from("user_profiles")
                .update({ email_verified_at: new Date().toISOString() })
                .eq("id", user.id);
            if (markerError) {
                console.error(
                    "oauth_email_verified_marker_failed:",
                    markerError.message,
                );
            }

            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // Exchange failed or no code — back to login with an error flag.
    return NextResponse.redirect(`${origin}/login?error=oauth`);
}
