"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DeviceShell from "@/components/DeviceShell";

export default function ThanksPage() {
  const { branchCode, stationCode } = useParams<{
    branchCode: string;
    stationCode: string;
  }>();
  const router = useRouter();
  const [sec, setSec] = useState(3);

  useEffect(() => {
    const t = setInterval(() => setSec((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (sec === 0) router.replace(`/${branchCode}/${stationCode}/start`);
  }, [sec, router, branchCode, stationCode]);

  return (
    <DeviceShell>
      <div className="min-h-screen p-6 grid place-content-center bg-gradient-to-br from-sky-400 to-cyan-400 text-white text-center">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-3xl font-extrabold mb-2">Terima Kasih!</h1>
        <p className="opacity-90 mb-10">
          Pendapat Anda sangat berarti bagi kami.
        </p>
        <div className="bg-white/20 px-6 py-4 rounded-2xl inline-block">
          Kembali ke halaman utama dalam
          <div className="text-4xl font-extrabold mt-2">{sec}</div>
          detik
        </div>
      </div>
    </DeviceShell>
  );
}
