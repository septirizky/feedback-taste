import { gristRecords } from "@/lib/grist";
import type { BranchFields, StationFields } from "@/types/grist";

export async function GET(req: Request) {
  try {
    const branchCode = (
      new URL(req.url).searchParams.get("branchCode") || ""
    ).toUpperCase();
    const [stations, branches] = await Promise.all([
      gristRecords<StationFields>(process.env.GRIST_TBL_STATIONS!),
      gristRecords<BranchFields>(process.env.GRIST_TBL_BRANCHES!),
    ]);

    const branch = branches.find(
      (b) => (b.fields.BranchCode || "").toUpperCase() === branchCode
    );
    if (!branch) return Response.json({ items: [] });

    const items = stations
      .filter((s) => (s.fields.StationStatus || "").toLowerCase() === "active")
      .filter((s) => s.fields.BranchCode === branch.id)
      .map((s) => ({
        stationCode: s.fields.StationCode,
        stationName: s.fields.StationName || s.fields.StationCode,
        branchCode,
      }));

    return Response.json({ items });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
