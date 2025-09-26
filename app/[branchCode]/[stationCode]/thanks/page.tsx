/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DeviceShell from "@/components/DeviceShell";

type BranchItem = { branchCode: string; branchName: string };
type BranchResponse = { items: BranchItem[] };

export default function ThanksPage() {
  const { branchCode, stationCode } = useParams<{
    branchCode: string;
    stationCode: string;
  }>();
  const router = useRouter();

  const [sec, setSec] = useState(3);
  const [branchName, setBranchName] = useState<string>("");

  useEffect(() => {
    const t = setInterval(() => setSec((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (sec === 0) router.replace(`/${branchCode}/${stationCode}/start`);
  }, [sec, router, branchCode, stationCode]);

  useEffect(() => {
    const code = String(branchCode || "").toUpperCase();
    if (!code) return;

    fetch("/api/grist/branches")
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return (await r.json()) as BranchResponse;
      })
      .then((d) => {
        const found = d.items.find(
          (b) => String(b.branchCode || "").toUpperCase() === code
        );
        setBranchName(found?.branchName ?? "");
      })
      .catch(() => setBranchName(""));
  }, [branchCode]);

  const logoSrc = useMemo(() => {
    const name = branchName.toUpperCase();
    const isPesisir =
      name === "PESISIR SEAFOOD MERUYA" || name === "PESISIR SEAFOOD BINTARO";
    return isPesisir ? "/Logo_Pesisir.png" : "/Logo_Bandar.png";
  }, [branchName]);

  return (
    <DeviceShell>
      <div className="relative h-full text-white overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-500/70 to-sky-500">
        {/* dekor pojok (shake + responsif) */}
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

        {/* konten tengah */}
        <div className="relative h-full grid place-items-center px-4 sm:px-6 text-center">
          <div>
            <img
              src={logoSrc}
              alt={branchName || "Logo"}
              className="mx-auto mb-5 sm:mb-6 h-16 sm:h-20 md:h-24 object-contain drop-shadow select-none pointer-events-none"
              loading="eager"
            />

            <h1 className="font-extrabold mb-2 text-2xl sm:text-3xl md:text-4xl">
              Terima Kasih!
            </h1>
            <p className="opacity-90 mb-6 sm:mb-8 text-base sm:text-lg">
              Pendapat Anda sangat berarti bagi kami.
            </p>

            <div className="inline-flex items-baseline gap-2 sm:gap-3 bg-white/20 px-5 sm:px-6 md:px-8 py-3 sm:py-4 rounded-2xl">
              <span className="text-sm sm:text-base">
                Kembali ke halaman utama dalam
              </span>
              <span
                aria-live="polite"
                className="tabular-nums font-extrabold leading-none text-3xl sm:text-4xl md:text-5xl"
              >
                {sec}
              </span>
              <span className="text-sm sm:text-base">detik</span>
            </div>
          </div>
        </div>
      </div>
    </DeviceShell>
  );
}
