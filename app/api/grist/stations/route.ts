import { NextRequest } from "next/server";
import { gristRecords } from "@/lib/grist";

export async function GET(req: NextRequest) {
  try {
    const branchCode = (
      req.nextUrl.searchParams.get("branchCode") || ""
    ).toUpperCase();
    const tblStations = process.env.GRIST_TBL_STATIONS!;
    const tblBranches = process.env.GRIST_TBL_BRANCHES!;

    const [stations, branches] = await Promise.all([
      gristRecords(tblStations),
      gristRecords(tblBranches),
    ]);

    const branch = branches.find(
      (b) => String(b.fields.BranchCode || "").toUpperCase() === branchCode
    );
    if (!branch) return Response.json({ items: [] });

    const items = stations
      .filter(
        (s) => String(s.fields.StationStatus || "").toLowerCase() === "active"
      )
      .filter((s) => s.fields.BranchCode === branch.id)
      .map((s) => ({
        stationCode: s.fields.StationCode,
        displayName: s.fields.DisplayName || s.fields.StationCode,
        branchCode,
      }));

    return Response.json({ items });
  } catch (e: any) {
    console.error("GET /api/grist/stations error:", e);
    return new Response(
      JSON.stringify({ error: e.message || "Internal error" }),
      { status: 500 }
    );
  }
}
