"use client";
import { ReactNode, useEffect } from "react";

export default function DeviceShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.style.height = "100%";
    document.body.style.height = "100%";
    document.body.style.overflowX = "hidden";
    return () => {
      document.documentElement.style.height = "";
      document.body.style.height = "";
      document.body.style.overflowX = "";
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-500 to-sky-400 flex justify-center items-center">
      {/* Kanvas ‘tablet’ 1024x768 (responsif, tapi idealnya segini) */}
      <div className="w-full h-screen max-w-[1024px] max-h-[768px] bg-white/70 backdrop-blur-sm shadow-2xl">
        {/* area konten yang bisa di-scroll vertikal bila perlu */}
        <div className="h-full overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
