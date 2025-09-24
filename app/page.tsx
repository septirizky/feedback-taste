"use client";
import { useEffect, useState } from "react";
import DeviceShell from "@/components/DeviceShell";
import Link from "next/link";

type Branch = { branchCode: string; branchName: string };

export default function BranchSelectPage() {
  const [items, setItems] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/grist/branches")
      .then(async (r) => {
        if (!r.ok) {
          const t = await r.text();
          throw new Error(`API /branches ${r.status} ${t}`);
        }
        return r.json();
      })
      .then((d) => setItems(d.items || []))
      .catch((e) => {
        console.error(e);
        alert("Gagal memuat cabang. Cek server log.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <DeviceShell>
      <div className="p-10">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
          Pilih Cabang
        </h1>
        <p className="text-gray-600 mb-6">
          Sentuh salah satu cabang untuk mulai.
        </p>
        {loading && <div>Memuat...</div>}
        <div className="grid gap-6 md:grid-cols-2">
          {items.map((b) => (
            <Link
              key={b.branchCode}
              href={`/${encodeURIComponent(b.branchCode)}`}
              className="block rounded-2xl shadow-md p-4 bg-white hover:shadow-lg transition"
            >
              <div className="text-2xl font-bold">{b.branchName}</div>
              <div className="text-base text-gray-500">{b.branchCode}</div>
            </Link>
          ))}
        </div>
      </div>
    </DeviceShell>
  );
}
