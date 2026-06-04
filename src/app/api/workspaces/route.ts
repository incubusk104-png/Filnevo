import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClientFactory } from "@/lib/mocking/factories";
import { applyEdgeGuard } from "@/lib/rate-limit";

export const runtime = "edge";

// GET /api/workspaces -> list workspaces for the current user
export async function GET(req: NextRequest) {
  const guard = applyEdgeGuard(req);
  if (guard) return guard;

  const supabase = await createSupabaseClientFactory();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "supabase_unavailable" }, { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });
  }

  // Fetch workspaces where user is owner or member
  const { data, error } = await supabase
    .from("workspaces")
    .select(`
      id,
      name,
      owner_id,
      created_at,
      workspace_members!left(role)
    `)
    .or(`owner_id.eq.${user.id},workspace_members.user_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  // Transform to include role and member count (simplified)
  const workspaces = data.map((w: any) => ({
    id: w.id,
    name: w.name,
    ownerId: w.owner_id,
    role: w.workspace_members?.[0]?.role ?? (w.owner_id === user.id ? "owner" : "member"),
    memberCount: 0, // TODO: compute actual count
    createdAt: w.created_at,
  }));

  return NextResponse.json({ ok: true, workspaces });
}

// POST /api/workspaces -> create a new workspace
export async function POST(req: NextRequest) {
  const guard = applyEdgeGuard(req);
  if (guard) return guard;

  const supabase = await createSupabaseClientFactory();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "supabase_unavailable" }, { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });
  }

  let body: { name?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ ok: false, error: "workspace_name_required" }, { status: 400 });
  }

  // Start transaction: insert workspace, then insert membership
  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .insert({ name, owner_id: user.id })
    .select()
    .single();

  if (workspaceError) {
    return NextResponse.json({ ok: false, error: workspaceError.message }, { status: 500 });
  }

  // Add owner as member
  const { error: memberError } = await supabase
    .from("workspace_members")
    .insert({ workspace_id: workspace.id, user_id: user.id, role: "owner" });

  if (memberError) {
    // Optionally, delete the workspace on failure (or leave as orphan)
    return NextResponse.json({ ok: false, error: memberError.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      ok: true,
      workspace: {
        id: workspace.id,
        name: workspace.name,
        ownerId: workspace.owner_id,
        role: "owner",
        memberCount: 1,
        createdAt: workspace.created_at,
      },
    },
    { status: 201 }
  );
}