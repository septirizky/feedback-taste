import { gristCreateMany, gristRecords, gristUpdateMany } from "@/lib/grist";
import type {
  RowId,
  StationFields,
  SauceFields,
  StationSauceFields,
} from "@/types/grist";

type Body = { stationCode: string; sauceIds: string[] };

type StationSauceFieldsNullable = Omit<
  StationSauceFields,
  "StationCode" | "SauceID"
> & {
  StationCode: RowId | null;
  SauceID: RowId;
};

type UnlinkFields = { StationCode: null };
type RelinkFields = { StationCode: RowId };

const up = (v: unknown) => String(v ?? "").toUpperCase();

export async function POST(req: Request) {
  try {
    const { stationCode, sauceIds } = (await req.json()) as Body;
    const code = up(stationCode);
    if (!code) return new Response("stationCode required", { status: 400 });

    const [stations, allMaps, sauces] = await Promise.all([
      gristRecords<StationFields>(process.env.GRIST_TBL_STATIONS!),
      gristRecords<StationSauceFieldsNullable>(
        process.env.GRIST_TBL_STATION_SAUCES!
      ),
      gristRecords<SauceFields>(process.env.GRIST_TBL_SAUCES!),
    ]);

    const station = stations.find((s) => up(s.fields.StationCode) === code);
    if (!station) return new Response("station not found", { status: 404 });

    const stationRowId: RowId = station.id;

    const codeByRowId = new Map<RowId, string>();
    const rowIdByCode = new Map<string, RowId>();
    for (const s of sauces) {
      const c = up(s.fields.SauceID ?? "");
      if (c) {
        codeByRowId.set(s.id, c);
        rowIdByCode.set(c, s.id);
      }
    }

    const mapsForThisStation = allMaps.filter(
      (r) => r.fields.StationCode === stationRowId
    );
    const inactiveByCode = new Map<string, RowId>();
    for (const r of allMaps) {
      if (r.fields.StationCode === null) {
        const c = codeByRowId.get(r.fields.SauceID) ?? "";
        if (c) inactiveByCode.set(c, r.id);
      }
    }

    const payloadCodes = new Set(sauceIds.map(up).filter(Boolean));
    const activeCodes = new Set(
      mapsForThisStation
        .map((r) => codeByRowId.get(r.fields.SauceID) ?? "")
        .filter(Boolean)
    );

    const toUnlinkIds = mapsForThisStation
      .filter((r) => !payloadCodes.has(codeByRowId.get(r.fields.SauceID) ?? ""))
      .map((r) => r.id);

    if (toUnlinkIds.length) {
      await gristUpdateMany<UnlinkFields>(
        process.env.GRIST_TBL_STATION_SAUCES!,
        toUnlinkIds.map((id) => ({ id, fields: { StationCode: null } }))
      );
    }

    const toReactivateIds = [...payloadCodes]
      .map((c) => inactiveByCode.get(c))
      .filter((id): id is RowId => typeof id === "number");

    if (toReactivateIds.length) {
      await gristUpdateMany<RelinkFields>(
        process.env.GRIST_TBL_STATION_SAUCES!,
        toReactivateIds.map((id) => ({
          id,
          fields: { StationCode: stationRowId },
        }))
      );
    }

    const reactivatedCodes = new Set<string>();
    for (const [k, v] of inactiveByCode.entries()) {
      if (toReactivateIds.includes(v)) reactivatedCodes.add(k);
    }
    const knownCodes = new Set<string>([...activeCodes, ...reactivatedCodes]);

    const toAddCodes = [...payloadCodes].filter(
      (c) => !knownCodes.has(c) && rowIdByCode.has(c)
    );

    if (toAddCodes.length) {
      const rows: StationSauceFields[] = toAddCodes.map((c) => ({
        BranchCode: station.fields.BranchCode,
        StationCode: stationRowId,
        SauceID: rowIdByCode.get(c)!,
      }));
      await gristCreateMany<StationSauceFields>(
        process.env.GRIST_TBL_STATION_SAUCES!,
        rows
      );
    }

    return Response.json({
      ok: true,
      unlinked: toUnlinkIds.length,
      reactivated: toReactivateIds.length,
      created: toAddCodes.length,
    });
  } catch (e) {
    console.error("station-sauces/save error:", e);
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(msg, { status: 500 });
  }
}
