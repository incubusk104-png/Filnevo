// Session-refresh middleware helper (@supabase/ssr).
//
// Runs on every matched request to refresh the Supabase auth token and sync the
// session cookies onto the response. In demo mode (no Supabase env) it is a
// no-op pass-through.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isDemoMode } from "@/lib/mode";

export async function updateSession(
  request: NextRequest,
): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  if (isDemoMode()) return response;

  const supabase = createServerClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Touch the user to trigger a token refresh + cookie rotation when needed.
  await supabase.auth.getUser();

  return response;
}
