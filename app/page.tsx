/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import DeviceShell from "@/components/DeviceShell";
import Link from "next/link";

type Branch = { branchCode: string; branchName: string };
type BranchListResponse = { items: Branch[] };

function isBranchListResponse(x: unknown): x is BranchListResponse {
  if (typeof x !== "object" || x === null) return false;
  const items = (x as { items?: unknown }).items;
  return (
    Array.isArray(items) &&
    items.every(
      (i) =>
        typeof i === "object" &&
        i !== null &&
        typeof (i as Branch).branchCode === "string" &&
        typeof (i as Branch).branchName === "string"
    )
  );
}

export default function BranchSelectPage() {
  const [items, setItems] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/grist/branches")
      .then(async (r) => {
        if (!r.ok) throw new Error(`/branches ${r.status} ${await r.text()}`);
        return r.json();
      })
      .then((d) => setItems(isBranchListResponse(d) ? d.items : []))
      .catch((e) => {
        console.error(e);
        alert("Gagal memuat Outlet. Cek server log.");
      })
      .finally(() => setLoading(false));
  }, []);

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
              Pilih Outlet
            </h1>
            <p className="text-slate-600 mt-1">
              Sentuh salah satu outlet untuk mulai.
            </p>
          </header>

          {loading ? (
            // skeleton
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
              {items.map((b) => (
                <Link
                  key={b.branchCode}
                  href={`/${encodeURIComponent(b.branchCode)}`}
                  className="
                    block rounded-3xl bg-white shadow-[0_8px_30px_rgba(0,0,0,.08)]
                    ring-1 ring-black/5 hover:shadow-[0_14px_40px_rgba(0,0,0,.10)]
                    transition p-5 md:p-6 group
                  "
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-2xl font-bold text-slate-800">
                        {b.branchName}
                      </div>
                      <div className="mt-2 inline-flex items-center gap-2 text-sm text-slate-500">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                          {b.branchCode}
                        </span>
                        <span className="opacity-70">Kode Outlet</span>
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
            </div>
          )}
        </div>
      </div>
    </DeviceShell>
  );
}
