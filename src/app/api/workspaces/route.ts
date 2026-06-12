import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClientFactory } from "@/lib/mocking/factories";
import { isDemoMode } from "@/lib/mode";
import { applyEdgeGuard } from "@/lib/rate-limit";

export const runtime = "edge";

interface WorkspaceSummaryRow {
    id: string;
    name: string;
    owner_id: string;
    role: string | null;
    member_count: number | null;
    created_at: string;
}

const toWorkspaceResponse = (
    workspace: WorkspaceSummaryRow,
    userId: string,
) => ({
    id: workspace.id,
    name: workspace.name,
    ownerId: workspace.owner_id,
    role:
        workspace.owner_id === userId ? "owner" : (workspace.role ?? "member"),
    memberCount: Number(workspace.member_count ?? 0),
    createdAt: workspace.created_at,
});

const slugifyWorkspaceName = (name: string): string => {
    const slug = name
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80)
        .replace(/-+$/g, "");

    return slug || "workspace";
};

const createWorkspaceSlug = (name: string): string => {
    return `${slugifyWorkspaceName(name)}-${crypto.randomUUID().slice(0, 8)}`;
};

const createDemoWorkspace = (name: string, userId: string) => ({
    id: `demo-workspace-${crypto.randomUUID().slice(0, 8)}`,
    name,
    ownerId: userId,
    role: "owner",
    memberCount: 1,
    createdAt: new Date().toISOString(),
});

// GET /api/workspaces -> list workspaces for the current user
export async function GET(req: NextRequest) {
    const guard = applyEdgeGuard(req);
    if (guard) return guard;

    const supabase = await createSupabaseClientFactory();
    if (!supabase) {
        return NextResponse.json(
            { ok: false, error: "supabase_unavailable" },
            { status: 500 },
        );
    }

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json(
            { ok: false, error: "unauthenticated" },
            { status: 401 },
        );
    }

    const { data, error } = await supabase.rpc(
        "list_accessible_workspace_summaries",
    );

    if (error) {
        return NextResponse.json(
            { ok: false, error: error.message },
            { status: 500 },
        );
    }

    const workspaces = (Array.isArray(data) ? data : []).map((workspace) =>
        toWorkspaceResponse(workspace as WorkspaceSummaryRow, user.id),
    );

    return NextResponse.json({ ok: true, workspaces });
}

// POST /api/workspaces -> create a new workspace
export async function POST(req: NextRequest) {
    const guard = applyEdgeGuard(req);
    if (guard) return guard;

    const supabase = await createSupabaseClientFactory();
    if (!supabase) {
        return NextResponse.json(
            { ok: false, error: "supabase_unavailable" },
            { status: 500 },
        );
    }

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json(
            { ok: false, error: "unauthenticated" },
            { status: 401 },
        );
    }

    let body: { name?: string } = {};
    try {
        body = await req.json();
    } catch {
        return NextResponse.json(
            { ok: false, error: "invalid_json" },
            { status: 400 },
        );
    }

    const name = body.name?.trim();
    if (!name) {
        return NextResponse.json(
            { ok: false, error: "workspace_name_required" },
            { status: 400 },
        );
    }

    const { data: workspace, error: workspaceError } = await supabase
        .from("workspaces")
        .insert({ name, slug: createWorkspaceSlug(name), owner_id: user.id })
        .select("id, name, owner_id, created_at")
        .single();

    if (workspaceError) {
        return NextResponse.json(
            { ok: false, error: workspaceError.message },
            { status: 500 },
        );
    }

    if (!workspace) {
        if (isDemoMode()) {
            return NextResponse.json(
                { ok: true, workspace: createDemoWorkspace(name, user.id) },
                { status: 201 },
            );
        }

        return NextResponse.json(
            { ok: false, error: "workspace_create_failed" },
            { status: 500 },
        );
    }

    const { error: memberError } = await supabase
        .from("workspace_members")
        .insert({
            workspace_id: workspace.id,
            user_id: user.id,
            role: "owner",
            accepted_at: new Date().toISOString(),
        });

    if (memberError) {
        await supabase.from("workspaces").delete().eq("id", workspace.id);
        return NextResponse.json(
            { ok: false, error: memberError.message },
            { status: 500 },
        );
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
        { status: 201 },
    );
}
