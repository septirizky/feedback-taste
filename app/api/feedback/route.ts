import { NextRequest } from "next/server";
import { gristCreate, gristRecords } from "@/lib/grist";

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

    const [branches, stations, sauces] = await Promise.all([
      gristRecords(tbl.branches),
      gristRecords(tbl.stations),
      gristRecords(tbl.sauces),
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

    // ---- Normalisasi nilai dari client (bisa dapat 1/0/"1"/"0"/"Like"/"Dislike") ----
    const rawLike = body.likeValue ?? body.lv ?? null;
    const rawStar = body.starValue ?? body.sv ?? null;

    // to "Like" | "Dislike" | null
    let likeText: string | null = null;
    if (rawLike !== null && rawLike !== "") {
      const yes =
        rawLike === true ||
        rawLike === 1 ||
        rawLike === "1" ||
        String(rawLike).toLowerCase() === "like";
      likeText = yes ? "Like" : "Dislike";
    }

    // to number 1..5 | null
    const starParsed = parseInt(rawStar, 10);
    const starValue =
      rawStar === null || rawStar === "" || Number.isNaN(starParsed)
        ? null
        : Math.max(1, Math.min(5, starParsed));

    // (opsional) log cepat biar gampang debug
    console.log("FEEDBACK payload ->", {
      branchCode,
      stationCode,
      sauceName,
      rawLike,
      rawStar,
      likeText,
      starValue,
    });

    const fields: any = {
      Branch: branch.id,
      Station: station.id,
      Sauce: sauce.id,
      LikeValue: likeText,
      StarValue: starValue,
      Comment: body.comment || "",
      SubmittedAt: new Date().toISOString(),
      Source: body.source || "tablet",
      IpAddr: body.ip || "",
    };

    const created = await gristCreate(tbl.feedbacks, fields);
    return Response.json({ ok: true, id: created?.id });
  } catch (e: any) {
    console.error("POST /api/feedback error:", e);
    return new Response(
      JSON.stringify({ error: e?.message || "Internal error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
