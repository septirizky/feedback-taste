/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import DeviceShell from "@/components/DeviceShell";
import { useParams } from "next/navigation";

type Station = { stationCode: string; stationName: string; branchCode: string };

type Branch = { branchCode: string; branchName: string };
type BranchListResponse = { items: Branch[] };
type StationListResponse = { items: Station[] };

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
function isStationListResponse(x: unknown): x is StationListResponse {
  if (typeof x !== "object" || x === null) return false;
  const items = (x as { items?: unknown }).items;
  return (
    Array.isArray(items) &&
    items.every(
      (it) =>
        typeof it === "object" &&
        it !== null &&
        typeof (it as Station).stationCode === "string" &&
        typeof (it as Station).stationName === "string" &&
        typeof (it as Station).branchCode === "string"
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
    (async () => {
      try {
        const sRes = await fetch(
          `/api/grist/stations?branchCode=${branchCodeUpper}`
        );
        if (!sRes.ok)
          throw new Error(`/stations ${sRes.status} ${await sRes.text()}`);
        const sJson = (await sRes.json()) as unknown;
        if (alive) setStations(isStationListResponse(sJson) ? sJson.items : []);

        const bRes = await fetch("/api/grist/branches");
        if (bRes.ok) {
          const bJson = (await bRes.json()) as unknown;
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
          alert("Gagal memuat data Station/Outlet. Cek server log.");
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [branchCodeUpper]);

  return (
    <DeviceShell>
      <div className="relative h-full text-white bg-gradient-to-br from-indigo-600 via-indigo-500/70 to-sky-500 overflow-hidden">
        <img
          src="/kerang.png"
          alt=""
          className="pointer-events-none select-none absolute top-2 left-2 w-16 sm:w-20 md:w-24 lg:w-28 opacity-90 deco-shake deco-slow deco-delay-150"
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

        <div className="mx-auto max-w-7xl h-full m-4 sm:m-6 md:m-8">
          <div className="flex h-full flex-col">
            <header className="p-5 sm:p-6 md:p-8 text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold opacity-80">
                Pilih Station
              </h1>
              <p className="mt-2 text-base sm:text-lg">
                Outlet:
                <span className="ml-2 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                  {branchName || branchCodeUpper}
                </span>
              </p>
            </header>

            <main className="flex-1 min-h-0 overflow-y-auto md:overflow-visible px-5 sm:px-6 md:px-8 pb-6">
              {loading ? (
                <div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-24 sm:h-28 rounded-2xl bg-slate-200/70 animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {stations.map((s) => (
                      <Link
                        key={s.stationCode}
                        href={`/${encodeURIComponent(
                          branchCodeUpper
                        )}/${encodeURIComponent(s.stationCode)}/map-sauces`}
                        className="block rounded-3xl bg-white/95 shadow-[0_8px_30px_rgba(0,0,0,.08)] ring-1 ring-black/5
                                   hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(0,0,0,.10)]
                                   transition p-5 sm:p-6 group"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-xl sm:text-2xl font-bold text-slate-800">
                              {s.stationName}
                            </div>
                            <div className="mt-2 text-xs sm:text-sm text-slate-500">
                              Kode:{" "}
                              <span className="font-mono">{s.stationCode}</span>
                            </div>
                          </div>
                          <span
                            aria-hidden
                            className="mt-1 inline-grid place-content-center size-8 sm:size-9 rounded-full bg-slate-100 text-slate-600
                                       group-hover:bg-emerald-50 group-hover:text-emerald-600 transition"
                          >
                            ➜
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {stations.length === 0 && (
                    <div className="mt-6 text-slate-600 text-center">
                      Tidak ada station aktif.
                    </div>
                  )}
                </>
              )}
            </main>

            <footer className="p-6 sm:p-6 md:p-12 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full bg-slate-700 text-white px-5 py-3 text-base hover:bg-slate-800 transition shadow"
              >
                ← Kembali pilih Outlet
              </Link>
            </footer>
          </div>
        </div>
      </div>
    </DeviceShell>
  );
}
