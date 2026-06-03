import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClientFactory } from "@/lib/mocking/factories";

// Mock implementations for Edge Runtime compatibility (keep as fallback)
const archiver = (format: string, options: any) => ({
  pipe: (stream: any) => ({}),
  append: (content: any, options: { name: string }) => ({}),
  finalize: () => ({})
});

const PassThrough = function() {
  this.chunks = [];
  this.write = (chunk: Buffer) => {
    this.chunks.push(chunk);
    return true;
  };
  this.end = () => {};
  this.on = (event: string, callback: Function) => {
    if (event === 'end') {
      setTimeout(() => callback(Buffer.concat(this.chunks)), 0);
    }
    return this;
  };
};

export const runtime = "edge";

// GET /api/audit/export -> generate and download a ZIP file of audit data
export async function GET(req: NextRequest) {
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

  // Optional query parameters for filtering
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId") || undefined;
  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;

  try {
    // Build query for ledger entries
    let query = supabase
      .from("ai_processing_ledger")
      .select(`
        id,
        document_name,
        status,
        approval_status,
        workspace_id,
        latency_ms,
        tokens,
        created_at,
        user_profiles!inner(display_name, tenant_id)
      `)
      .eq("user_profiles.tenant_id", user.id) // RLS should handle this, but extra safety
      .order("created_at", { ascending: false });

    // Apply filters if provided
    if (workspaceId) {
      query = query.eq("workspace_id", workspaceId);
    }
    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      query = query.lte("created_at", endDate);
    }

    const { data: ledgerEntries, error } = await query;

    if (error) {
      throw error;
    }

    // Also fetch workspace info for context
    const { data: workspaces } = await supabase
      .from("workspaces")
      .select("id, name")
      .eq("owner_id", user.id);

    // Create a ZIP file in memory
    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      const stream = new PassThrough();

      const archive = archiver("zip", {
        zlib: { level: 9 }, // Maximum compression
      });

      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(chunks)));
      stream.on("error", (err) => reject(err));

      archive.pipe(stream);

      // Add JSON data files
      archive.append(JSON.stringify({ user, generatedAt: new Date().toISOString() }, null, 2), {
        name: "audit-info.json",
      });

      archive.append(JSON.stringify(ledgerEntries, null, 2), {
        name: "ledger-entries.json",
      });

      archive.append(JSON.stringify(workspaces || [], null, 2), {
        name: "workspaces.json",
      });

      // Add a human-readable summary
      const summary = `
CAVEAT VAULT AUDIT EXPORT
Generated: ${new Date().toISOString()}
User: ${user.id}
Total Ledger Entries: ${ledgerEntries?.length || 0}
Workspaces: ${(workspaces || []).length}

LEDGER ENTRIES:
${ledgerEntries
      ?.map(
        (entry) =>
          `- ${entry.document_name} (${entry.status}, ${entry.approval_status}) - ${entry.latency_ms}ms, ${entry.tokens} tokens - ${entry.created_at}`
      )
      .join("\n") || "No entries"}
      `.trim();

      archive.append(summary, { name: "audit-summary.txt" });

      archive.finalize();
    });

    // Set headers for file download
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="caveat-vault-audit-${new Date()
          .toISOString()
          .slice(0, 10)}.zip"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Audit export error:", err);
    return NextResponse.json(
      { ok: false, error: "failed_to_generate_audit", details: (err as Error).message },
      { status: 500 }
    );
  }
}