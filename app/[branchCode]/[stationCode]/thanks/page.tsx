/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DeviceShell from "@/components/DeviceShell";

type BranchItem = {
  branchCode: string;
  branchName: string;
};

type BranchResponse = {
  items: BranchItem[];
};

export default function ThanksPage() {
  const { branchCode, stationCode } = useParams<{
    branchCode: string;
    stationCode: string;
  }>();
  const router = useRouter();

  const [sec, setSec] = useState(3);
  const [branchName, setBranchName] = useState<string>("");

  // countdown
  useEffect(() => {
    const t = setInterval(() => setSec((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (sec === 0) router.replace(`/${branchCode}/${stationCode}/start`);
  }, [sec, router, branchCode, stationCode]);

  // ambil branchName dari API
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
      .catch(() => {
        // fallback: tetap lanjut tanpa branchName
        setBranchName("");
      });
  }, [branchCode]);

  // pilih logo berdasar branchName
  const logoSrc = useMemo(() => {
    const name = branchName.toUpperCase();
    const isPesisir =
      name === "PESISIR SEAFOOD MERUYA" || name === "PESISIR SEAFOOD BINTARO";
    return isPesisir ? "/Logo_Pesisir.png" : "/Logo_Bandar.png";
  }, [branchName]);

  return (
    <DeviceShell>
      <div className="relative h-full text-white overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-500/70 to-sky-500">
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

        {/* center content */}
        <div className="relative h-full grid place-items-center px-6 text-center">
          <div>
            <img
              src={logoSrc}
              alt={branchName || "Logo"}
              className="h-20 md:h-24 mx-auto mb-6 drop-shadow select-none pointer-events-none"
              loading="eager"
            />

            <h1 className="text-3xl font-extrabold mb-2">Terima Kasih!</h1>
            <p className="opacity-90 mb-8">
              Pendapat Anda sangat berarti bagi kami.
            </p>

            <div className="inline-flex items-baseline gap-2 bg-white/20 px-6 py-4 rounded-2xl">
              <span>Kembali ke halaman utama dalam</span>
              <span className="text-4xl md:text-5xl font-extrabold leading-none tabular-nums">
                {sec}
              </span>
              <span>detik</span>
            </div>
          </div>
        </div>
      </div>
    </DeviceShell>
  );
}
