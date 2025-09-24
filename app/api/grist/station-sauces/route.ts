import { NextRequest } from "next/server";
import { gristRecords } from "@/lib/grist";

export async function GET(req: NextRequest) {
  try {
    const stationCode = (
      req.nextUrl.searchParams.get("stationCode") || ""
    ).toUpperCase();
    if (!stationCode) return Response.json({ items: [] });

    const tblStationSauces = process.env.GRIST_TBL_STATION_SAUCES!;
    const tblStations = process.env.GRIST_TBL_STATIONS!;
    const tblSauces = process.env.GRIST_TBL_SAUCES!;

    const [stationSauces, stations, sauces] = await Promise.all([
      gristRecords(tblStationSauces),
      gristRecords(tblStations),
      gristRecords(tblSauces),
    ]);

    const sauceById = new Map(sauces.map((s) => [s.id, s.fields]));

    const station = stations.find(
      (s) => String(s.fields.StationCode || "").toUpperCase() === stationCode
    );
    if (!station) return Response.json({ items: [] });

    const items = stationSauces
      .filter((r) => r.fields.StationCode === station.id)
      .map((r) => {
        const srow = sauceById.get(r.fields.SauceName);

        return {
          code: String(srow?.SauceCode ?? r.fields.StationSauceID ?? r.id),
          sauceName: String(srow?.SauceName ?? ""),
          description: String(
            srow?.SauceDescription ?? r.fields.SauceDescription ?? ""
          ),
          iconUrl:
            srow?.SauceImage ??
            r.fields.SauceImage ??
            "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg",
        };
      });

    return Response.json({ items });
  } catch (e: any) {
    console.error("GET /api/grist/station-sauces error:", e);
    return new Response(
      JSON.stringify({ error: e?.message || "Internal error" }),
      {
        status: 500,
      }
    );
  }
}
