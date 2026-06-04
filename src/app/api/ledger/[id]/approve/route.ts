import { NextRequest, NextResponse } from "next/server";
import { createMockSupabaseClient as createClient } from "@/mock/lib/supabase/server";
import { applyEdgeGuard } from "@/lib/rate-limit";

export const runtime = "edge";

// POST /api/ledger/[id]/approve -> update approval status of a ledger entry
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = applyEdgeGuard(req);
  if (guard) return guard;

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "supabase_unavailable" }, { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });
  }

  const { id: ledgerId } = await params;
  if (!ledgerId) {
    return NextResponse.json({ ok: false, error: "ledger_id_required" }, { status: 400 });
  }

  let body: { approval_status?: "pending" | "approved" | "rejected" } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const { approval_status } = body;
  if (!approval_status || !["pending", "approved", "rejected"].includes(approval_status)) {
    return NextResponse.json(
      { ok: false, error: "invalid_approval_status" },
      { status: 400 }
    );
  }

  // First, fetch the ledger entry to check workspace ownership (optional, but we can do for clarity)
  const { data: ledgerEntry, error: fetchError } = await supabase
    .from("ai_processing_ledger")
    .select("id, workspace_id")
    .eq("id", ledgerId)
    .single();

  if (fetchError) {
    return NextResponse.json({ ok: false, error: "ledger_not_found" }, { status: 404 });
  }

  // If the ledger entry has a workspace_id, we need to check if the user is the owner of that workspace.
  // RLS will enforce this, but we can also check here to provide a better error message.
  // However, note that the RLS policy for update only allows when workspace_id is not null and the user is the owner.
  // We'll attempt the update and let RLS handle the authorization.

  const { error: updateError } = await supabase
    .from("ai_processing_ledger")
    .update({ approval_status })
    .eq("id", ledgerId);

  if (updateError) {
    // Check if the error is due to RLS (insufficient privileges)
    if (updateError.code === "23505" || updateError.message.includes("row-level security")) {
      return NextResponse.json(
        { ok: false, error: "unauthorized_to_update_ledger" },
        { status: 403 }
      );
    }
    return NextResponse.json({ ok: false, error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: "approval_status_updated" });
}