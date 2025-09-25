/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import DeviceShell from "@/components/DeviceShell";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type BranchItem = { branchCode: string; branchName: string };
type BranchListResponse = { items: BranchItem[] };

function isBranchListResponse(x: unknown): x is BranchListResponse {
  if (typeof x !== "object" || x === null) return false;
  const items = (x as { items?: unknown }).items;
  if (!Array.isArray(items)) return false;
  return items.every(
    (it) =>
      typeof it === "object" &&
      it !== null &&
      typeof (it as { branchCode?: unknown }).branchCode === "string" &&
      typeof (it as { branchName?: unknown }).branchName === "string"
  );
}

export default function StartPage() {
  const { branchCode, stationCode } = useParams<{
    branchCode: string;
    stationCode: string;
  }>();

  const [branchName, setBranchName] = useState<string>("");

  useEffect(() => {
    const code = String(branchCode ?? "").toUpperCase();
    if (!code) {
      setBranchName("");
      return;
    }
    fetch("/api/grist/branches")
      .then((r) => r.json())
      .then((json) => {
        if (!isBranchListResponse(json)) {
          setBranchName(code);
          return;
        }
        const hit = json.items.find((b) => b.branchCode.toUpperCase() === code);
        setBranchName(hit?.branchName ?? code);
      })
      .catch(() => setBranchName(code));
  }, [branchCode]);

  // pilih logo: Pesisir (Meruya/Bintaro) vs selainnya Bandar
  const logoSrc = useMemo(() => {
    const name = branchName.trim().toUpperCase();
    const pesisir =
      name === "PESISIR SEAFOOD MERUYA" || name === "PESISIR SEAFOOD BINTARO";
    return pesisir ? "/Logo_Pesisir.png" : "/Logo_Bandar.png";
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

        {/* konten utama */}
        <div className="h-full p-10 grid place-content-center text-center">
          <img
            src={logoSrc}
            alt={branchName || "Logo"}
            className="mx-auto mb-6 h-20 md:h-28 object-contain drop-shadow-lg"
            loading="eager"
          />

          <h1 className="text-5xl font-extrabold mb-3 drop-shadow">
            {branchName || "Bandar Djakarta"}
          </h1>

          <p className="text-xl max-w-2xl mx-auto opacity-95">
            Terima kasih sudah mencoba saus kami! Silakan beri pendapat Anda
            tentang cita rasa saus yang telah Anda coba.
          </p>

          <Link
            href={`/${encodeURIComponent(branchCode)}/${encodeURIComponent(
              stationCode
            )}/station-sauces`}
            className="mt-12 inline-flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-12 py-5 text-2xl rounded-full shadow-lg shadow-black/10 transition"
          >
            🚀 Mulai Feedback
          </Link>
        </div>
      </div>
    </DeviceShell>
  );
}
