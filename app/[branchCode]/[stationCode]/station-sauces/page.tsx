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
      .then((d) => setItems((d.items ?? []).slice(0, 4))) // tetap batasi 4
      .catch((e) => {
        console.error(e);
        alert("Gagal memuat saus. Cek server log.");
      })
      .finally(() => setLoading(false));
  }, [stationCode]);

  return (
    <DeviceShell>
      <div className="relative h-full overflow-y-auto bg-gradient-to-b from-slate-50 via-white to-orange-50">
        {/* dekor pojok */}
        <img
          src="/kerang.png"
          alt=""
          className="pointer-events-none select-none absolute top-2 left-2  w-16 sm:w-20 md:w-24 lg:w-28 opacity-90 deco-shake deco-slow deco-delay-150"
        />
        <img
          src="/udang.png"
          alt=""
          className="pointer-events-none select-none absolute top-2 right-2 w-16 sm:w-20 md:w-24 lg:w-28 opacity-90 deco-shake deco-fast deco-delay-300"
        />
        <img
          src="/kepiting.png"
          alt=""
          className="pointer-events-none select-none absolute bottom-2 left-2 w-16 sm:w-20 md:w-24 lg:w-28 opacity-90 deco-shake deco-slow deco-delay-450"
        />
        <img
          src="/cumi.png"
          alt=""
          className="pointer-events-none select-none absolute bottom-2 right-2 w-16 sm:w-20 md:w-24 lg:w-28 opacity-90 deco-shake deco-fast deco-delay-600"
        />

        {/* konten */}
        <div className="mx-auto max-w-7xl h-full flex flex-col">
          <div className="px-4 sm:px-6 pt-16 md:pt-22 pb-4 text-center">
            <h1 className="font-extrabold text-slate-800 text-2xl sm:text-3xl md:text-5xl">
              Pilih Saus yang Anda Coba
            </h1>
            <p className="mt-2 sm:mt-3 text-slate-600 text-sm sm:text-base md:text-lg">
              Klik pada saus yang baru saja Anda rasakan
            </p>
          </div>

          {loading && (
            <div className="px-6 text-center text-slate-500">Memuat…</div>
          )}

          <div className="px-4 sm:px-6 flex-1">
            {/* Grid rapi & auto-center untuk 1–3 item, responsif untuk 4+ */}
            <div
              className="
                grid gap-4 sm:gap-6 md:gap-8
                max-w-6xl mx-auto             /* batasi lebar di layar besar */
                [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]
              "
            >
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
                  className="
                    w-full h-full
                    group rounded-2xl md:rounded-3xl bg-white/90 backdrop-blur
                    shadow-[0_8px_24px_rgba(0,0,0,.08)] md:shadow-[0_10px_30px_rgba(0,0,0,.08)]
                    ring-1 ring-black/5 p-4 sm:p-6 md:p-8
                    hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(0,0,0,.10)]
                    transition
                    flex flex-col items-center text-center
                  "
                >
                  {/* ICON */}
                  <div className="mb-4 sm:mb-5 md:mb-6">
                    <div className="relative rounded-full overflow-hidden shadow-xl bg-gradient-to-br from-sky-400 to-indigo-500 size-16 sm:size-20 md:size-24">
                      {s.iconUrl ? (
                        <img
                          src={s.iconUrl}
                          alt={s.sauceName}
                          className="absolute inset-0 w-full h-full object-cover"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="absolute inset-0 grid place-content-center text-2xl sm:text-3xl md:text-4xl">
                          🌶️
                        </span>
                      )}
                    </div>
                  </div>

                  {/* JUDUL – tinggi konsisten agar baris rata */}
                  <h2
                    className="
                      font-extrabold text-slate-800 leading-snug
                      text-base sm:text-lg md:text-2xl px-2
                      min-h-[3.2rem] sm:min-h-[3.6rem] md:min-h-[4rem]
                      grid place-items-center
                    "
                    title={s.sauceName}
                  >
                    {s.sauceName}
                  </h2>

                  {/* DESKRIPSI – tinggi konsisten */}
                  <p
                    className="
                      mt-1 sm:mt-2 text-slate-600
                      text-xs sm:text-sm md:text-base px-3 leading-snug
                      min-h-[2.1rem] sm:min-h-[2.4rem] md:min-h-[2.7rem]
                    "
                    title={s.description}
                  >
                    {s.description}
                  </p>

                  {/* Spacer untuk meratakan tinggi konten */}
                  <div className="mt-auto" />
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 text-center">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded-full bg-slate-700 text-white
                         text-sm sm:text-base md:text-lg px-4 sm:px-5 md:px-6
                         py-2.5 sm:py-3 md:py-3.5 hover:bg-slate-800 transition shadow"
            >
              ← Kembali
            </button>
          </div>
        </div>
      </div>
    </DeviceShell>
  );
}
