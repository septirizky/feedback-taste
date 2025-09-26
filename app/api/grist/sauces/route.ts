import { gristRecords } from "@/lib/grist";
import type { SauceFields } from "@/types/grist";

export async function GET() {
  const recs = await gristRecords<SauceFields>(process.env.GRIST_TBL_SAUCES!);
  // (opsional) filter active
  const items = recs.map((r) => ({
    rowId: r.id,
    sauceID: r.fields.SauceID,
    name: r.fields.SauceName,
    desc: r.fields.SauceDescription ?? "",
    image: r.fields.SauceImage ?? "",
  }));
  return Response.json({ items });
}
