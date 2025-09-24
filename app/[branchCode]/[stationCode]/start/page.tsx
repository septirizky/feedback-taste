"use client";
import Link from "next/link";
import DeviceShell from "@/components/DeviceShell";
import { useParams } from "next/navigation";

export default function StartPage() {
  const { branchCode, stationCode } = useParams<{
    branchCode: string;
    stationCode: string;
  }>();

  return (
    <DeviceShell>
      <div className="h-full p-10 grid place-content-center text-center bg-gradient-to-br from-indigo-500 to-sky-400 text-white">
        <div className="bg-white/20 w-32 h-32 rounded-full mb-8 grid place-content-center text-5xl">
          🍽️
        </div>
        <h1 className="text-5xl font-extrabold mb-3">Restoran Seafood</h1>
        <div className="opacity-90 mb-8 text-2xl">Premium Taste Experience</div>
        <p className="text-xl max-w-2xl mx-auto">
          Terima kasih sudah mencoba saus kami! Silakan beri pendapat Anda
          tentang cita rasa saus yang telah Anda coba.
        </p>
        <Link
          href={`/${encodeURIComponent(branchCode)}/${encodeURIComponent(
            stationCode
          )}/station-sauces`}
          className="mt-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-12 py-5 text-2xl rounded-full"
        >
          🚀 Mulai Feedback
        </Link>
      </div>
    </DeviceShell>
  );
}
