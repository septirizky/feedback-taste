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
  const likeValue = sp.get("lv"); // "1" | "0"
  const starValue = sp.get("sv"); // "1".."5"

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
          likeValue: Number(likeValue), // 1 atau 0
          starValue: Number(starValue), // 1..5
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
      <div className="p-10">
        <div className="text-3xl mb-4 text-center">💭</div>
        <h1 className="text-4xl font-extrabold text-gray-800 text-center mb-2">
          Saran & Komentar
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Bagikan pengalaman Anda (opsional)
        </p>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          rows={6}
          className="w-full border rounded-2xl p-4 outline-none focus:ring-2 ring-sky-300 bg-white"
          placeholder="Tulis saran, kritik, atau komentar Anda di sini... (opsional)"
        />
        <div className="text-right text-gray-500 text-sm mt-1">
          {comment.length}/500
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => router.back()}
            className="px-5 py-3 rounded-full bg-gray-600 text-white"
          >
            ← Kembali
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 px-5 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow"
          >
            {submitting ? "Mengirim..." : "📤 Kirim Feedback"}
          </button>
        </div>
      </div>
    </DeviceShell>
  );
}
