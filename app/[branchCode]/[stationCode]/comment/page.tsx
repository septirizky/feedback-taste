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

        {/* content */}
        <div className="mx-auto max-w-7xl h-full flex flex-col">
          <div className="flex-1 grid place-items-center px-6 py-8">
            <div className="w-full max-w-4xl rounded-3xl bg-white/90 backdrop-blur ring-1 ring-black/5 shadow-[0_10px_30px_rgba(0,0,0,.08)] p-6 md:p-8">
              <div className="text-center">
                <div className="mx-auto mb-4 size-16 md:size-20 rounded-full bg-slate-100 grid place-content-center shadow-inner">
                  💭
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800">
                  Saran & Komentar
                </h1>
                <p className="mt-1 text-slate-600">
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
                rows={6}
                placeholder="Tulis saran, kritik, atau komentar Anda di sini... (opsional)"
                className="mt-6 w-full rounded-2xl border border-slate-200 bg-white p-4 outline-none ring-0 focus:border-sky-300 focus:ring-2 focus:ring-sky-300"
              />
              <div className="mt-1 text-right text-xs text-slate-500">
                {comment.length}/500
              </div>

              {/* actions */}
              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full rounded-full bg-emerald-500 px-6 py-4 text-lg font-semibold text-white shadow hover:bg-emerald-600 disabled:opacity-50"
                >
                  {submitting ? "Mengirim..." : "🚀 Kirim Feedback"}
                </button>

                <button
                  onClick={() => router.back()}
                  className="mx-auto inline-flex items-center gap-2 rounded-full bg-slate-700 px-5 py-3 text-base text-white shadow hover:bg-slate-800"
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
