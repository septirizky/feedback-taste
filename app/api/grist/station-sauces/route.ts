import { gristRecords } from "@/lib/grist";
import type {
  StationFields,
  StationSauceFields,
  SauceFields,
} from "@/types/grist";

export async function GET(req: Request) {
  try {
    const stationCode = (
      new URL(req.url).searchParams.get("stationCode") || ""
    ).toUpperCase();
    if (!stationCode) return Response.json({ items: [] });

    const [ss, stations, sauces] = await Promise.all([
      gristRecords<StationSauceFields>(process.env.GRIST_TBL_STATION_SAUCES!),
      gristRecords<StationFields>(process.env.GRIST_TBL_STATIONS!),
      gristRecords<SauceFields>(process.env.GRIST_TBL_SAUCES!),
    ]);

    const sauceById = new Map<number, SauceFields>(
      sauces.map((s) => [s.id, s.fields])
    );
    const station = stations.find(
      (s) => (s.fields.StationCode || "").toUpperCase() === stationCode
    );
    if (!station) return Response.json({ items: [] });

    const items = ss
      .filter((r) => r.fields.StationCode === station.id)
      .map((r) => {
        const srow = sauceById.get(r.fields.SauceName);
        return {
          code: String(srow?.SauceID ?? r.fields.StationSauceID ?? r.id),
          sauceName: String(srow?.SauceName ?? ""),
          description: String(
            srow?.Description ?? r.fields.SauceDescription ?? ""
          ),
          iconUrl:
            srow?.Image ??
            r.fields.SauceImage ??
            "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg",
        };
      });

    return Response.json({ items });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
