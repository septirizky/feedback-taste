"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import DeviceShell from "@/components/DeviceShell";
import { useParams } from "next/navigation";

type Station = { stationCode: string; displayName: string; branchCode: string };

export default function StationSelectPage() {
  const { branchCode } = useParams<{ branchCode: string }>();
  const [items, setItems] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/grist/stations?branchCode=${branchCode}`)
      .then(async (r) => {
        if (!r.ok) {
          const t = await r.text();
          throw new Error(`/stations ${r.status} ${t}`);
        }
        return r.json();
      })
      .then((d) => setItems(d.items || []))
      .catch((e) => {
        console.error(e);
        alert("Gagal memuat station. Cek server log.");
      })
      .finally(() => setLoading(false));
  }, [branchCode]);

  return (
    <DeviceShell>
      <div className="p-10">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
          Pilih Station
        </h1>
        <p className="text-gray-600 mb-6">
          Cabang: <span className="font-semibold">{branchCode}</span>
        </p>
        {loading && <div>Memuat...</div>}
        <div className="grid gap-6 md:grid-cols-2">
          {items.map((s) => (
            <Link
              key={s.stationCode}
              href={`/${encodeURIComponent(branchCode)}/${encodeURIComponent(
                s.stationCode
              )}/start`}
              className="block rounded-2xl shadow-md p-5 bg-white hover:shadow-lg"
            >
              <div className="text-2xl font-bold">{s.displayName}</div>
              <div className="text-base text-gray-500">{s.stationCode}</div>
            </Link>
          ))}
        </div>

        <Link
          href="/"
          className="inline-flex mt-10 text-base text-gray-600 hover:underline"
        >
          ← Kembali pilih cabang
        </Link>
      </div>
    </DeviceShell>
  );
}
