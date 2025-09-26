/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useRef, useState } from "react";
import DeviceShell from "@/components/DeviceShell";
import type React from "react";

type CSSVars = React.CSSProperties & {
  "--dx"?: string;
  "--dy"?: string;
  "--rot"?: string;
  "--dur"?: string;
  "--delay"?: string;
  "--size"?: string;
};

type Particle = {
  id: number;
  char: string;
  style: CSSVars;
};

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

  const overlayRef = useRef<HTMLDivElement>(null);
  const likeBtnRef = useRef<HTMLButtonElement>(null);
  const dislikeBtnRef = useRef<HTMLButtonElement>(null);

  const [particles, setParticles] = useState<Particle[]>([]);

  function spawnBurst(from: "like" | "dislike") {
    const srcRef = from === "like" ? likeBtnRef : dislikeBtnRef;
    const host = overlayRef.current?.getBoundingClientRect();
    const src = srcRef.current?.getBoundingClientRect();
    if (!host || !src) return;

    const originLeft = src.left + src.width / 2 - host.left;
    const originTop = src.top + src.height / 2 - host.top;

    const up = from === "like";
    const N = 16;
    const now = Date.now();

    const batch: Particle[] = Array.from({ length: N }, (_, i) => {
      const dx = (Math.random() * 240 - 120).toFixed(1) + "px";
      const dy =
        ((up ? -1 : 1) * (100 + Math.random() * 160)).toFixed(1) + "px";
      const rot = (Math.random() * 120 - 60).toFixed(1) + "deg";
      const dur = (0.95 + Math.random() * 0.8).toFixed(2) + "s";
      const delay = (Math.random() * 0.15).toFixed(2) + "s";
      const size = (22 + Math.random() * 16).toFixed(0) + "px";

      return {
        id: now + i,
        char: up ? "👍" : "😢",
        style: {
          left: originLeft, // px (angka OK di React style)
          top: originTop, // px
          "--dx": dx,
          "--dy": dy,
          "--rot": rot,
          "--dur": dur,
          "--delay": delay,
          "--size": size,
        },
      };
    });

    setParticles((p) => [...p, ...batch]);
    setTimeout(() => {
      setParticles((p) => p.filter((q) => !batch.find((b) => b.id === q.id)));
    }, 1900);
  }

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
      <div className="relative h-full overflow-y-auto bg-gradient-to-b from-slate-50 via-white to-orange-50">
        {/* dekor pojok – dibuat responsif */}
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

        {/* overlay emoji */}
        <div
          ref={overlayRef}
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          {particles.map((p) => (
            <span key={p.id} className="burst-emoji" style={p.style}>
              {p.char}
            </span>
          ))}
        </div>

        {/* konten */}
        <div className="mx-auto max-w-7xl h-full flex flex-col">
          <div className="px-4 sm:px-6 pt-16 md:pt-22 pb-4 text-center">
            <div className="mb-4 sm:mb-5 md:mb-6 text-3xl sm:text-4xl md:text-5xl">
              🌊
            </div>
            <h1 className="font-extrabold text-gray-800 text-2xl sm:text-3xl md:text-4xl">
              Bagaimana pendapat Anda tentang
            </h1>
            <div className="text-emerald-600 font-semibold mt-2 text-2xl sm:text-3xl md:text-4xl">
              {sauceName}
            </div>
          </div>

          {/* pilihan like/dislike – responsif */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-2xl mx-auto mb-8 md:mb-10">
            <button
              ref={likeBtnRef}
              onClick={() => {
                setLike(true);
                spawnBurst("like");
              }}
              className={`rounded-2xl text-white font-bold shadow-lg
                          px-5 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6
                          text-lg sm:text-xl md:text-2xl
                          ${
                            like === true
                              ? "bg-emerald-600"
                              : "bg-emerald-500 hover:bg-emerald-600"
                          }`}
            >
              👍 Cocok
            </button>
            <button
              ref={dislikeBtnRef}
              onClick={() => {
                setLike(false);
                spawnBurst("dislike");
              }}
              className={`rounded-2xl text-white font-bold shadow-lg
                          px-5 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6
                          text-lg sm:text-xl md:text-2xl
                          ${
                            like === false
                              ? "bg-rose-600"
                              : "bg-rose-500 hover:bg-rose-600"
                          }`}
            >
              😢 Kurang Cocok
            </button>
          </div>

          {/* rating bintang – responsif */}
          <div className="text-center text-gray-700 text-base sm:text-lg md:text-xl mb-3 md:mb-4">
            Beri rating bintang:
          </div>
          <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-8 md:mb-10">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setStars(n)}
                className={`text-3xl sm:text-4xl md:text-5xl ${
                  n <= stars ? "opacity-100" : "opacity-40"
                }`}
                aria-label={`${n} stars`}
              >
                ⭐
              </button>
            ))}
          </div>

          {/* aksi lanjut */}
          <div className="text-center">
            <button
              onClick={goNext}
              disabled={!canContinue}
              className="bg-sky-500 disabled:opacity-50 hover:bg-sky-600 text-white font-semibold
                         rounded-full shadow
                         text-lg sm:text-xl md:text-2xl
                         px-8 sm:px-10 md:px-12
                         py-4 sm:py-5"
            >
              Lanjutkan →
            </button>
            <div className="mt-3 text-xs sm:text-sm md:text-base text-gray-500">
              {like === null
                ? "Pilih Cocok/Kurang Cocok"
                : like
                ? "Like dipilih"
                : "Dislike dipilih"}{" "}
              · {stars === 0 ? "Pilih bintang" : `${stars} ⭐`}
            </div>
          </div>

          <div className="p-4 sm:p-6 text-center">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded-full bg-slate-700 text-white
                         text-sm sm:text-base md:text-lg
                         px-4 sm:px-5 md:px-6
                         py-2.5 sm:py-3 md:py-3.5
                         hover:bg-slate-800 transition shadow"
            >
              ← Kembali
            </button>
          </div>
        </div>
      </div>
    </DeviceShell>
  );
}
