"use client";
import { ReactNode } from "react";

export default function MobileShell({ children }: { children: ReactNode }) {
  // 360x640 feeling, tapi tetap responsive
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-500 to-sky-400 flex items-start justify-center">
      <div className="w-full max-w-[420px] min-h-screen bg-white/70 backdrop-blur-sm">
        {children}
      </div>
    </div>
  );
}
