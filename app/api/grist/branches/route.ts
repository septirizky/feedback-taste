import { gristList } from "@/lib/grist";

export async function GET() {
  try {
    const table = process.env.GRIST_TBL_BRANCHES!;
    const rows = await gristList(table);
    const items = rows
      .filter((r: any) => (r.BranchStatus || "").toLowerCase() === "active")
      .map((r: any) => ({
        branchCode: r.BranchCode,
        branchName: r.BranchName,
      }));
    return Response.json({ items });
  } catch (e: any) {
    console.error("GET /api/grist/branches error:", e);
    return new Response(
      JSON.stringify({ error: e?.message || "Internal error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
