export type RowId = number;

export interface GristRecord<T extends object> {
  id: RowId;
  fields: T;
}
export interface GristResponse<T extends object> {
  records: Array<GristRecord<T>>;
}

const BASE = (process.env.GRIST_BASE_URL ?? "").replace(/\/+$/, "");
const RAW_DOC = process.env.GRIST_DOC_ID ?? "";
const DOC = RAW_DOC.split("/")[0] ?? "";
const KEY = process.env.GRIST_API_KEY ?? "";

function gristUrl(table: string, path = "records"): string {
  if (!BASE || !DOC || !KEY) {
    throw new Error(
      "Missing GRIST env. Need GRIST_BASE_URL, GRIST_DOC_ID, GRIST_API_KEY"
    );
  }
  return `${BASE}/api/docs/${encodeURIComponent(
    DOC
  )}/tables/${encodeURIComponent(table)}/${path}`;
}

async function assertOk(res: Response, url: string) {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("GRIST FETCH ERROR");
    console.error("URL   :", url);
    console.error("STATUS:", res.status);
    console.error("BODY  :", text.slice(0, 400));
    throw new Error(`Grist request failed ${res.status}`);
  }
}

export async function gristList<T extends object>(
  table: string,
  params?: Record<string, string>
): Promise<T[]> {
  const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
  const url = gristUrl(table, "records") + qs;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${KEY}` },
    cache: "no-store",
  });
  await assertOk(res, url);

  const json = (await res.json()) as GristResponse<T>;
  return (json.records ?? []).map((r) => r.fields);
}

export async function gristRecords<T extends object>(
  table: string,
  params?: Record<string, string>
): Promise<Array<GristRecord<T>>> {
  const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
  const url = gristUrl(table, "records") + qs;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${KEY}` },
    cache: "no-store",
  });
  await assertOk(res, url);

  const json = (await res.json()) as GristResponse<T>;
  return json.records ?? [];
}

export async function gristCreate<T extends object>(
  table: string,
  fields: T
): Promise<GristRecord<T>> {
  const url = gristUrl(table, "records");
  const body = JSON.stringify({ records: [{ fields }] });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
    },
    body,
    cache: "no-store",
  });
  await assertOk(res, url);

  const json = (await res.json()) as GristResponse<T>;
  const rec = json.records?.[0];
  if (!rec) throw new Error("gristCreate: empty response");
  return rec;
}

export async function gristCreateMany<T extends object>(
  table: string,
  rows: T[]
): Promise<void> {
  if (!rows.length) return;
  const url = gristUrl(table, "records");
  const body = JSON.stringify({
    records: rows.map((fields) => ({ fields })),
  });
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
    },
    body,
    cache: "no-store",
  });
  await assertOk(res, url);
}

export async function gristUpdateMany<T extends object>(
  table: string,
  rows: Array<{ id: RowId; fields: Partial<T> }>
): Promise<void> {
  if (!rows.length) return;
  const url = gristUrl(table, "records");
  const body = JSON.stringify({ records: rows });
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
    },
    body,
    cache: "no-store",
  });
  await assertOk(res, url);
}
