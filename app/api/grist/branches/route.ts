import { gristList } from "@/lib/grist";
import { BranchFields } from "@/types/grist";

export async function GET() {
  try {
    const rows = await gristList<BranchFields>(process.env.GRIST_TBL_BRANCHES!);
    const items = rows
      .filter((r) => (r.BranchStatus ?? "").toLowerCase() === "active")
      .map((r) => ({ branchCode: r.BranchCode, branchName: r.BranchName }));
    return Response.json({ items });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
