/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useState } from "react";
import DeviceShell from "@/components/DeviceShell";

export default function RatePage() {
  const { branchCode, stationCode } = useParams<{
    branchCode: string;
    stationCode: string;
  }>();
  const sp = useSearchParams();
  const sauceName = sp.get("s") || "";
  const router = useRouter();

  const [like, setLike] = useState<null | boolean>(null);
  const [stars, setStars] = useState<number>(0);

  const canContinue = like !== null && stars > 0;

  function goNext() {
    const payload = new URLSearchParams({
      s: sauceName,
      lv: like ? "1" : "0",
      sv: String(stars),
    });
    router.push(`/${branchCode}/${stationCode}/comment?${payload.toString()}`);
  }

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
            <div className="text-5xl mb-6 text-center">🌊</div>
            <h1 className="text-4xl font-extrabold text-gray-800 text-center">
              Bagaimana pendapat Anda tentang
            </h1>
            <div className="text-center text-emerald-600 font-semibold text-3xl mb-10">
              {sauceName}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 max-w-2xl mx-auto mb-10">
            <button
              onClick={() => setLike(true)}
              className={`rounded-2xl p-6 text-white font-bold shadow-lg ${
                like === true
                  ? "bg-emerald-600"
                  : "bg-emerald-500 hover:bg-emerald-600"
              }`}
            >
              👍 Cocok
            </button>
            <button
              onClick={() => setLike(false)}
              className={`rounded-2xl p-6 text-white font-bold shadow-lg ${
                like === false ? "bg-rose-600" : "bg-rose-500 hover:bg-rose-600"
              }`}
            >
              👎 Kurang Cocok
            </button>
          </div>

          {/* PILIH BINTANG (tidak meniadakan like) */}
          <div className="text-center text-gray-700 text-xl mb-4">
            Beri rating bintang:
          </div>
          <div className="flex items-center justify-center gap-3 mb-10">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setStars(n)}
                className={`text-5xl ${
                  n <= stars ? "opacity-100" : "opacity-40"
                }`}
                aria-label={`${n} stars`}
              >
                ⭐
              </button>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={goNext}
              disabled={!canContinue}
              className="bg-sky-500 disabled:opacity-50 hover:bg-sky-600 text-white font-semibold px-12 py-5 text-2xl rounded-full shadow"
            >
              Lanjutkan →
            </button>
            <div className="mt-3 text-sm text-gray-500">
              {like === null
                ? "Pilih Cocok/Kurang Cocok"
                : like
                ? "Like dipilih"
                : "Dislike dipilih"}{" "}
              · {stars === 0 ? "Pilih bintang" : `${stars} ⭐`}
            </div>
          </div>

          <div className="p-6 text-center">
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
