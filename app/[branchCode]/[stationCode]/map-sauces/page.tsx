/* eslint-disable @next/next/no-img-element */
"use client";

import DeviceShell from "@/components/DeviceShell";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type SauceVM = {
  rowId: number;
  sauceID: string;
  name: string;
  desc: string;
  image: string;
};

type SauceListResponse = { items: SauceVM[] };
type MapIdsItem = { sauceRowId: number };
type MapIdsResponse = { items: MapIdsItem[] };
type MapFullItem = { sauceRowId?: number; sauceID?: number };
type Chosen = Set<number>;

export default function MapSaucesPage() {
  const { branchCode, stationCode } = useParams<{
    branchCode: string;
    stationCode: string;
  }>();
  const router = useRouter();

  const [allSauces, setAllSauces] = useState<SauceVM[]>([]);
  const [checked, setChecked] = useState<Chosen>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const maxPick = 3;
  const count = checked.size;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const saucesRes = await fetch("/api/grist/sauces", {
          cache: "no-store",
        });
        if (!saucesRes.ok) throw new Error(await saucesRes.text());
        const saucesJson: SauceListResponse = await saucesRes.json();

        const idsRes = await fetch(
          `/api/grist/station-sauces?stationCode=${encodeURIComponent(
            String(stationCode || "")
          )}&idsOnly=1`,
          { cache: "no-store" }
        );

        let selectedIds = new Set<number>();
        if (idsRes.ok) {
          const mapJson: MapIdsResponse = await idsRes.json();
          selectedIds = new Set((mapJson.items ?? []).map((x) => x.sauceRowId));
        } else {
          const mapRes = await fetch(
            `/api/grist/station-sauces?stationCode=${encodeURIComponent(
              String(stationCode || "")
            )}`,
            { cache: "no-store" }
          );
          if (mapRes.ok) {
            const fullJson: { items: MapFullItem[] } = await mapRes.json();
            const ids = (fullJson.items ?? [])
              .map((x) =>
                typeof x.sauceRowId === "number"
                  ? x.sauceRowId
                  : typeof x.sauceID === "number"
                  ? x.sauceID
                  : -1
              )
              .filter((n) => n > 0);
            selectedIds = new Set(ids);
          }
        }

        if (!alive) return;

        setAllSauces(
          (saucesJson.items ?? []).map((s) => ({
            rowId: s.rowId,
            sauceID: s.sauceID,
            name: s.name,
            desc: s.desc ?? "",
            image: s.image ?? "",
          }))
        );
        setChecked(selectedIds);
      } catch (e) {
        console.error(e);
        alert("Gagal memuat data saus / mapping. Cek server log.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [stationCode]);

  function toggle(id: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        if (next.size >= maxPick) {
          alert(`Maksimal ${maxPick} saus.`);
          return prev;
        }
        next.add(id);
      }
      return next;
    });
  }

  async function save() {
    setSaving(true);
    try {
      const sauceIds = Array.from(checked)
        .map((rid) => allSauces.find((s) => s.rowId === rid)?.sauceID)
        .filter((v): v is string => !!v);

      const body = { stationCode: String(stationCode || ""), sauceIds };

      const r = await fetch("/api/grist/station-sauces/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error(await r.text());

      router.replace(
        `/${encodeURIComponent(String(branchCode || ""))}/${encodeURIComponent(
          String(stationCode || "")
        )}/start`
      );
    } catch (e) {
      console.error(e);
      alert("Gagal menyimpan mapping. Cek server log.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DeviceShell>
      <div className="relative h-full overflow-hidden bg-gradient-to-b from-slate-50 via-white to-orange-50">
        <img
          src="/kerang.png"
          alt=""
          className="pointer-events-none select-none absolute top-2 left-2  w-16 sm:w-20 md:w-24 opacity-90 deco-shake deco-slow deco-delay-150"
        />
        <img
          src="/udang.png"
          alt=""
          className="pointer-events-none select-none absolute top-2 right-2 w-16 sm:w-20 md:w-24 opacity-90 deco-shake deco-fast deco-delay-300"
        />
        <img
          src="/kepiting.png"
          alt=""
          className="pointer-events-none select-none absolute bottom-2 left-2 w-16 sm:w-20 md:w-24 opacity-90 deco-shake deco-slow deco-delay-450"
        />
        <img
          src="/cumi.png"
          alt=""
          className="pointer-events-none select-none absolute bottom-2 right-2 w-16 sm:w-20 md:w-24 opacity-90 deco-shake deco-fast deco-delay-600"
        />

        <div className="mx-auto max-w-7xl h-full flex flex-col px-4 sm:px-6">
          <header className="pt-10 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-slate-800">
              Pilih Saus untuk Station Ini
            </h1>
            <p className="mt-2 text-slate-600 text-sm sm:text-base">
              Maksimal {maxPick} saus. {count}/{maxPick} terpilih.
            </p>
          </header>

          <main className="flex-1 min-h-0 overflow-y-auto py-6">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-28 rounded-2xl bg-slate-200/60 animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 px-4 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2 md:gap-4">
                {allSauces.map((s) => {
                  const active = checked.has(s.rowId);
                  const disabled = !active && checked.size >= maxPick;
                  return (
                    <button
                      key={s.rowId}
                      type="button"
                      onClick={() => toggle(s.rowId)}
                      aria-pressed={active}
                      disabled={disabled}
                      className={`w-full text-left rounded-3xl bg-white/95 ring-1 ${
                        active ? "ring-emerald-400" : "ring-black/5"
                      } shadow-[0_8px_24px_rgba(0,0,0,.08)] p-5 transition
                      hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(0,0,0,.10)]
                      ${disabled ? "opacity-50 pointer-events-none" : ""}
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative size-16 sm:size-20 md:size-24 rounded-full overflow-hidden bg-gradient-to-br from-sky-400 to-indigo-500 shrink-0">
                          {s.image ? (
                            <img
                              src={s.image}
                              alt={s.name}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          ) : (
                            <span className="absolute inset-0 grid place-content-center">
                              🌶️
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-800 text-base sm:text-lg md:text-xl whitespace-normal break-words leading-snug">
                            {s.name}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </main>

          <footer className="py-8 text-center">
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold
                         text-sm sm:text-base md:text-lg
                         px-6 sm:px-5 md:px-10
                         py-3 sm:py-3 md:py-4
                         hover:bg-slate-800 transition shadow"
            >
              {saving ? "Menyimpan…" : "Lanjutkan"}
            </button>
            <div className="mt-3">
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
          </footer>
        </div>
      </div>
    </DeviceShell>
  );
}
