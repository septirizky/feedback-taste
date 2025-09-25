/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import DeviceShell from "@/components/DeviceShell";
import { useParams } from "next/navigation";

type Station = { stationCode: string; displayName: string; branchCode: string };
type Branch = { branchCode: string; branchName: string };
type BranchListResponse = { items: Branch[] };

function isBranchListResponse(x: unknown): x is BranchListResponse {
  if (typeof x !== "object" || x === null) return false;
  const items = (x as { items?: unknown }).items;
  return (
    Array.isArray(items) &&
    items.every(
      (it) =>
        typeof it === "object" &&
        it !== null &&
        typeof (it as Branch).branchCode === "string" &&
        typeof (it as Branch).branchName === "string"
    )
  );
}

export default function StationSelectPage() {
  const { branchCode } = useParams<{ branchCode: string }>();

  const [stations, setStations] = useState<Station[]>([]);
  const [branchName, setBranchName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const branchCodeUpper = useMemo(
    () => String(branchCode ?? "").toUpperCase(),
    [branchCode]
  );

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        // 1) stations
        const sRes = await fetch(
          `/api/grist/stations?branchCode=${branchCodeUpper}`
        );
        if (!sRes.ok)
          throw new Error(`/stations ${sRes.status} ${await sRes.text()}`);
        const sJson = await sRes.json();
        if (alive) setStations(Array.isArray(sJson.items) ? sJson.items : []);

        // 2) branch name
        const bRes = await fetch("/api/grist/branches");
        if (bRes.ok) {
          const bJson = await bRes.json();
          if (isBranchListResponse(bJson)) {
            const hit = bJson.items.find(
              (b) => b.branchCode.toUpperCase() === branchCodeUpper
            );
            if (alive) setBranchName(hit?.branchName ?? branchCodeUpper);
          } else if (alive) setBranchName(branchCodeUpper);
        } else if (alive) setBranchName(branchCodeUpper);
      } catch (e) {
        console.error(e);
        if (alive) {
          setStations([]);
          setBranchName(branchCodeUpper);
          alert("Gagal memuat data station/Outlet. Cek server log.");
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [branchCodeUpper]);

  return (
    <DeviceShell>
      <div className="relative h-full overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-500/70 to-sky-500">
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
        <div className="mx-auto max-w-7xl h-full bg-white/85 backdrop-blur-sm rounded-3xl shadow-[0_12px_60px_rgba(0,0,0,.18)] ring-1 ring-black/10 m-5 md:m-8 p-6 md:p-8">
          <header className="mb-6 text-center">
            <h1 className="text-4xl font-extrabold text-slate-800">
              Pilih Station
            </h1>
            <p className="text-slate-600 mt-1">
              Outlet:
              <span className="ml-2 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                {branchName || branchCodeUpper}
              </span>
            </p>
          </header>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-2xl bg-slate-200/60 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {stations.map((s) => (
                <Link
                  key={s.stationCode}
                  href={`/${encodeURIComponent(
                    branchCodeUpper
                  )}/${encodeURIComponent(s.stationCode)}/start`}
                  className="
                    block rounded-3xl bg-white shadow-[0_8px_30px_rgba(0,0,0,.08)]
                    ring-1 ring-black/5 hover:shadow-[0_14px_40px_rgba(0,0,0,.10)]
                    transition p-5 md:p-6 group
                  "
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-2xl font-bold text-slate-800">
                        {s.displayName}
                      </div>
                      <div className="mt-2 text-sm text-slate-500">
                        Kode: <span className="font-mono">{s.stationCode}</span>
                      </div>
                    </div>
                    <span
                      aria-hidden
                      className="mt-1 inline-flex size-9 rounded-full bg-slate-100 text-slate-600 grid place-content-center
                                 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition"
                    >
                      ➜
                    </span>
                  </div>
                </Link>
              ))}
              {stations.length === 0 && (
                <div className="text-slate-600">Tidak ada station aktif.</div>
              )}
            </div>
          )}

          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-slate-700 text-white px-5 py-3 text-base hover:bg-slate-800 transition shadow"
            >
              ← Kembali pilih Outlet
            </Link>
          </div>
        </div>
      </div>
    </DeviceShell>
  );
}
