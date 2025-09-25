import { NextRequest } from "next/server";
import { gristCreate, gristRecords } from "@/lib/grist";

function stripIp(ip: string) {
  return ip.replace(/^\[?(.+?)\]?(:\d+)?$/, "$1");
}

function getClientIp(req: NextRequest): string {
  const h = req.headers;

  const candidates = [
    "cf-connecting-ip",
    "x-client-ip",
    "x-real-ip",
    "x-forwarded-for",
    "x-forwarded",
    "forwarded",
    "fastly-client-ip",
    "fly-client-ip",
  ];

  for (const k of candidates) {
    const v = h.get(k);
    if (!v) continue;

    if (k === "x-forwarded-for") {
      return stripIp(v.split(",")[0].trim());
    }
    if (k === "forwarded") {
      const m = /for="?([^;"]+)/i.exec(v);
      if (m?.[1]) return stripIp(m[1]);
      continue;
    }
    return stripIp(v);
  }

  return "127.0.0.1";
}

type DeviceSource = "mobile" | "tablet" | "desktop";

function detectDeviceSource(uaRaw: string | null): DeviceSource {
  const ua = (uaRaw ?? "").toLowerCase();

  if (/ipad|tablet|playbook|kindle/.test(ua)) return "tablet";
  if (/android/.test(ua) && !/mobile/.test(ua)) return "tablet";

  if (/mobi|iphone|ipod|phone|android.*mobile/.test(ua)) return "mobile";
  return "desktop";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const branchCode = String(body.branchCode || "").toUpperCase();
    const stationCode = String(body.stationCode || "").toUpperCase();
    const sauceName = String(body.sauceName || "");

    const tbl = {
      feedbacks: process.env.GRIST_TBL_FEEDBACKS!,
      branches: process.env.GRIST_TBL_BRANCHES!,
      stations: process.env.GRIST_TBL_STATIONS!,
      sauces: process.env.GRIST_TBL_SAUCES!,
    };

    const ipAddr = getClientIp(req);
    const ua = req.headers.get("user-agent");
    const device = detectDeviceSource(ua);

    const [branches, stations, sauces] = await Promise.all([
      gristRecords<{ BranchCode: string }>(tbl.branches),
      gristRecords<{ StationCode: string }>(tbl.stations),
      gristRecords<{ SauceName: string; Name?: string }>(tbl.sauces),
    ]);

    const branch = branches.find(
      (b) => String(b.fields.BranchCode || "").toUpperCase() === branchCode
    );
    const station = stations.find(
      (s) => String(s.fields.StationCode || "").toUpperCase() === stationCode
    );
    const sauce = sauces.find(
      (s) => String(s.fields.SauceName || s.fields.Name || "") === sauceName
    );

    if (!branch || !station || !sauce) {
      console.error("Ref not found", { branchCode, stationCode, sauceName });
      return new Response(JSON.stringify({ error: "Reference not found" }), {
        status: 400,
      });
    }

    const rawLike = body.likeValue ?? body.lv ?? null;
    const rawStar = body.starValue ?? body.sv ?? null;

    let likeText: "Like" | "Dislike" | null = null;
    if (rawLike !== null && rawLike !== "") {
      const yes =
        rawLike === true ||
        rawLike === 1 ||
        rawLike === "1" ||
        String(rawLike).toLowerCase() === "like";
      likeText = yes ? "Like" : "Dislike";
    }

    const starParsed = parseInt(rawStar, 10);
    const starValue =
      rawStar === null || rawStar === "" || Number.isNaN(starParsed)
        ? null
        : Math.max(1, Math.min(5, starParsed));

    const fields = {
      Branch: branch.id,
      Station: station.id,
      Sauce: sauce.id,
      LikeValue: likeText,
      StarValue: starValue,
      Comment: body.comment || "",
      SubmittedAt: new Date().toISOString(),
      Source: device,
      IpAddr: ipAddr,
    };

    const created = await gristCreate(tbl.feedbacks, fields);
    return Response.json({ ok: true, id: created.id });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("POST /api/feedback error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
