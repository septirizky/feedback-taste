/* eslint-disable @next/next/no-img-element */
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
    const url = `/api/grist/station-sauces?stationCode=${encodeURIComponent(
      String(stationCode || "")
    )}`;
    fetch(url)
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      })
      .then((d) => setItems(d.items ?? []))
      .catch((e) => {
        console.error(e);
        alert("Gagal memuat saus. Cek server log.");
      })
      .finally(() => setLoading(false));
  }, [stationCode]);

  const visible = items.slice(0, 4);

  return (
    <DeviceShell>
      <div className="relative h-full overflow-hidden bg-gradient-to-b from-slate-50 via-white to-orange-50">
        <img
          src="/kerang.png"
          alt=""
          className="pointer-events-none select-none absolute top-2 left-2  w-24 md:w-28 opacity-90 deco-shake deco-slow deco-delay-150"
        />
        <img
          src="/udang.png"
          alt=""
          className="pointer-events-none select-none absolute top-2 right-2 w-24 md:w-28 opacity-90 deco-shake deco-fast deco-delay-300"
        />
        <img
          src="/kepiting.png"
          alt=""
          className="pointer-events-none select-none absolute bottom-2 left-2 w-24 md:w-28 opacity-90 deco-shake deco-slow deco-delay-450"
        />
        <img
          src="/cumi.png"
          alt=""
          className="pointer-events-none select-none absolute bottom-2 right-2 w-24 md:w-28 opacity-90 deco-shake deco-fast deco-delay-600"
        />

        {/* konten */}
        <div className="mx-auto max-w-7xl h-full flex flex-col">
          <div className="px-6 pt-22 pb-4 text-center">
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-800">
              Pilih Saus yang Anda Coba
            </h1>
            <p className="mt-3 text-slate-600 text-base md:text-lg">
              Klik pada saus yang baru saja Anda rasakan
            </p>
          </div>

          {loading && (
            <div className="px-6 text-center text-slate-500">Memuat…</div>
          )}

          <div className="px-6 flex-1 grid place-items-center">
            <div
              className="
                w-full grid gap-6 md:gap-8
                grid-cols-1 sm:grid-cols-2 xl:grid-cols-4
                justify-items-stretch
              "
            >
              {visible.map((s) => (
                <button
                  key={s.code}
                  onClick={() =>
                    router.push(
                      `/${encodeURIComponent(branchCode)}/${encodeURIComponent(
                        stationCode
                      )}/rate?s=${encodeURIComponent(s.sauceName)}`
                    )
                  }
                  className="
                    group rounded-3xl bg-white/90 backdrop-blur
                    shadow-[0_10px_30px_rgba(0,0,0,.08)] ring-1 ring-black/5
                    p-6 md:p-8 hover:-translate-y-0.5
                    hover:shadow-[0_16px_40px_rgba(0,0,0,.10)]
                    transition text-center
                  "
                >
                  <div className="flex flex-col items-center">
                    <div className="relative mb-6">
                      <div className="relative size-28 md:size-36 rounded-full overflow-hidden shadow-xl bg-gradient-to-br from-sky-400 to-indigo-500">
                        {s.iconUrl ? (
                          <img
                            src={s.iconUrl}
                            alt={s.sauceName}
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span className="absolute inset-0 grid place-content-center text-4xl">
                            🌶️
                          </span>
                        )}
                      </div>
                    </div>

                    <h2 className="text-xl md:text-2xl font-extrabold text-slate-800">
                      {s.sauceName}
                    </h2>
                    <p className="mt-2 text-slate-600 text-sm md:text-base max-w-prose">
                      {s.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="px-6 pb-6 text-center">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded-full bg-slate-700 text-white px-5 py-3 text-base hover:bg-slate-800 transition shadow"
            >
              ← Kembali
            </button>
          </div>
        </div>
      </div>
    </DeviceShell>
  );
}
