"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DeviceShell from "@/components/DeviceShell";

type Sauce = {
  code: string;
  sauceName: string;
  description: string;
  iconUrl?: string;
};

export default function StationSaucesPage() {
  const { branchCode, stationCode } = useParams<{
    branchCode: string;
    stationCode: string;
  }>();
  const router = useRouter();
  const [items, setItems] = useState<Sauce[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/grist/station-sauces?stationCode=${stationCode}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      })
      .then((d) => setItems(d.items || []))
      .catch((e) => {
        console.error(e);
        alert("Gagal memuat saus. Cek server log.");
      })
      .finally(() => setLoading(false));
  }, [stationCode]);

  return (
    <DeviceShell>
      <div className="p-10">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
          Pilih Saus yang Anda Coba
        </h1>
        <p className="text-gray-600 mb-6">
          Klik pada saus yang baru saja Anda rasakan
        </p>
        {loading && <div>Memuat...</div>}

        <div className="grid gap-6 md:grid-cols-2">
          {items.map((s) => (
            <button
              key={s.code}
              onClick={() =>
                router.push(
                  `/${encodeURIComponent(branchCode)}/${encodeURIComponent(
                    stationCode
                  )}/rate?s=${encodeURIComponent(s.sauceName)}`
                )
              }
              className="rounded-2xl bg-white shadow-lg p-5 text-left hover:shadow-xl transition"
            >
              <div className="flex items-center gap-4">
                {/* ICON dari Grist */}
                <div className="w-20 h-20 rounded-full overflow-hidden bg-orange-50 flex items-center justify-center">
                  {s.iconUrl ? (
                    <img
                      src={s.iconUrl}
                      alt={s.sauceName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-4xl">🌶️</span>
                  )}
                </div>

                <div className="flex-1">
                  <div className="text-2xl font-bold">{s.sauceName}</div>
                  <div className="text-gray-600 text-lg">{s.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => router.back()}
          className="mt-10 text-lg text-gray-600 hover:underline"
        >
          ← Kembali
        </button>
      </div>
    </DeviceShell>
  );
}
