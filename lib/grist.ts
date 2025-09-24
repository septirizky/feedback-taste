const BASE = (process.env.GRIST_BASE_URL || "").replace(/\/+$/, "");
const RAW = process.env.GRIST_DOC_ID || "";
const KEY = process.env.GRIST_API_KEY || "";

const DOC = RAW.split("/")[0];

function gristUrl(table: string, path = "records") {
  if (!BASE || !DOC || !KEY) {
    throw new Error(
      "Missing GRIST env. Need GRIST_BASE_URL, GRIST_DOC_ID, GRIST_API_KEY"
    );
  }
  return `${BASE}/api/docs/${encodeURIComponent(
    DOC
  )}/tables/${encodeURIComponent(table)}/${path}`;
}

export async function gristList(
  table: string,
  params?: Record<string, string>
) {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  const url = gristUrl(table) + qs;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${KEY}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("GRIST FETCH ERROR");
    console.error("URL   :", url);
    console.error("STATUS:", res.status);
    console.error("BODY  :", text.slice(0, 400));
    throw new Error(`Grist list ${table} failed ${res.status}`);
  }

  try {
    const json = await res.json();
    return (json.records || []).map((r: any) => r.fields);
  } catch (e) {
    console.error("GRIST JSON PARSE ERROR on:", url);
    throw new Error(`Grist list ${table} invalid JSON: ${e}`);
  }
}

export async function gristRecords(
  table: string,
  params?: Record<string, string>
) {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  const url = `${(process.env.GRIST_BASE_URL || "").replace(
    /\/+$/,
    ""
  )}/api/docs/${
    (process.env.GRIST_DOC_ID || "").split("/")[0]
  }/tables/${encodeURIComponent(table)}/records${qs}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.GRIST_API_KEY}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`gristRecords ${table} failed ${res.status}: ${t}`);
  }
  const json = await res.json();
  // return apa adanya: [{id, fields:{...}}, ...]
  return json.records as Array<{ id: number; fields: Record<string, any> }>;
}

export async function gristCreate(table: string, fields: Record<string, any>) {
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
  if (!res.ok)
    throw new Error(
      `gristCreate ${table} failed ${res.status}: ${await res
        .text()
        .catch(() => "")}`
    );
  const json = await res.json();
  return json.records?.[0];
}
