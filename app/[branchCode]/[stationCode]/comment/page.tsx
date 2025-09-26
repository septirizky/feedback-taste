/* eslint-disable @next/next/no-img-element */
"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import DeviceShell from "@/components/DeviceShell";

export default function CommentPage() {
  const { branchCode, stationCode } = useParams<{
    branchCode: string;
    stationCode: string;
  }>();
  const sp = useSearchParams();
  const sauceName = sp.get("s") || "";
  const likeValue = sp.get("lv");
  const starValue = sp.get("sv");

  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit() {
    if (likeValue === null || starValue === null) {
      alert("Silakan pilih Cocok/Kurang Cocok dan bintang terlebih dahulu.");
      return;
    }
    setSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchCode,
          stationCode,
          sauceName,
          likeValue: Number(likeValue),
          starValue: Number(starValue),
          comment,
          source: "tablet",
        }),
      });
      router.replace(`/${branchCode}/${stationCode}/thanks`);
    } catch {
      alert("Gagal mengirim feedback. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DeviceShell>
      <div className="relative h-full overflow-y-auto bg-gradient-to-b from-slate-50 via-white to-orange-50">
        {/* dekor pojok – responsif & shake */}
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
          <div className="flex-1 grid place-items-center px-4 sm:px-6 py-6 md:py-8">
            <div className="w-full max-w-4xl rounded-3xl bg-white/90 backdrop-blur ring-1 ring-black/5 shadow-[0_10px_30px_rgba(0,0,0,.08)] p-4 sm:p-6 md:p-8">
              <div className="text-center">
                <div className="mx-auto mb-3 sm:mb-4 size-12 sm:size-14 md:size-16 rounded-full bg-slate-100 grid place-content-center shadow-inner">
                  💭
                </div>
                <h1 className="font-extrabold text-slate-800 text-2xl sm:text-3xl md:text-4xl">
                  Saran & Komentar
                </h1>
                <p className="mt-1 text-slate-600 text-sm sm:text-base md:text-lg">
                  Bagikan pengalaman Anda (opsional)
                </p>
              </div>

              {/* textarea */}
              <label htmlFor="comment" className="sr-only">
                Komentar
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                placeholder="Tulis saran, kritik, atau komentar Anda di sini... (opsional)"
                className="mt-5 w-full rounded-2xl border border-slate-200 bg-white
                           text-sm sm:text-base md:text-lg
                           p-3 sm:p-4 md:p-5
                           min-h-[140px] sm:min-h-[160px] md:min-h-[200px]
                           outline-none ring-0 focus:border-sky-300 focus:ring-2 focus:ring-sky-300"
              />
              <div className="mt-1 text-right text-[11px] sm:text-xs md:text-sm text-slate-500">
                {comment.length}/500
              </div>

              {/* actions */}
              <div className="mt-5 sm:mt-6 flex flex-col gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full rounded-full bg-emerald-500 text-white font-semibold shadow
                             text-base sm:text-lg md:text-xl
                             px-6 sm:px-8 md:px-10
                             py-3 sm:py-4 md:py-5
                             hover:bg-emerald-600 disabled:opacity-50"
                >
                  {submitting ? "Mengirim..." : "🚀 Kirim Feedback"}
                </button>

                <button
                  onClick={() => router.back()}
                  className="mx-auto inline-flex items-center gap-2 rounded-full bg-slate-700 text-white shadow
                             text-sm sm:text-base md:text-lg
                             px-4 sm:px-5 md:px-6
                             py-2.5 sm:py-3 md:py-3.5
                             hover:bg-slate-800"
                >
                  ← Kembali
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DeviceShell>
  );
}
