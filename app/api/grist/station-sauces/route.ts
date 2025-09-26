import { gristRecords } from "@/lib/grist";
import type {
  StationFields,
  StationSauceFields,
  SauceFields,
} from "@/types/grist";

const toNum = (v: unknown) => (typeof v === "number" ? v : Number(v) || -1);
const up = (v: unknown) => String(v ?? "").toUpperCase();

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const stationCode = up(url.searchParams.get("stationCode"));
    const idsOnly = ["1", "true"].includes(
      (url.searchParams.get("idsOnly") || "").toLowerCase()
    );

    if (!stationCode) return Response.json({ items: [] });

    const [ss, stations, sauces] = await Promise.all([
      gristRecords<StationSauceFields>(process.env.GRIST_TBL_STATION_SAUCES!),
      gristRecords<StationFields>(process.env.GRIST_TBL_STATIONS!),
      gristRecords<SauceFields>(process.env.GRIST_TBL_SAUCES!),
    ]);

    const station = stations.find(
      (s) => up(s.fields.StationCode) === stationCode
    );
    if (!station) return Response.json({ items: [] });

    const stationRowId = station.id;
    const stationCodeStr = up(station.fields.StationCode);
    const sauceById = new Map<number, SauceFields>(
      sauces.map((s) => [s.id, s.fields])
    );
    const sauceRowIdByCode = new Map<string, number>(
      sauces.map((s) => [up(s.fields.SauceID), s.id])
    );

    // filter baris milik station (rowId atau legacy string)
    const mine = ss.filter((r) => {
      const sc = r.fields.StationCode as unknown;
      return toNum(sc) === stationRowId || up(sc) === stationCodeStr;
    });

    if (idsOnly) {
      // kembalikan ROWID saus:
      const items = mine
        .map((r) => {
          const raw = r.fields.SauceID as unknown;
          if (typeof raw === "number") return raw; // referensi rowId
          const rid = sauceRowIdByCode.get(up(raw)); // legacy string -> cari rowId
          return rid ?? -1;
        })
        .filter((n) => n > 0)
        .map((id) => ({ sauceRowId: id }));
      return Response.json({ items });
    }

    // mode lama: data siap tampil
    const items = mine.map((r) => {
      const raw = r.fields.SauceID as unknown;
      const rid =
        typeof raw === "number" ? raw : sauceRowIdByCode.get(up(raw))!;
      const srow = sauceById.get(rid);
      return {
        code: String(srow?.SauceID ?? r.fields.StationSauceID ?? r.id),
        sauceName: String(srow?.SauceName ?? ""),
        description: String(srow?.SauceDescription ?? ""),
        iconUrl:
          srow?.SauceImage ??
          "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg",
      };
    });

    return Response.json({ items });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
