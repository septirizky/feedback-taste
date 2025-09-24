"use client";
import Link from "next/link";
import { ReactNode } from "react";
export default function FancyButton({
  href,
  onClick,
  children,
  kind = "primary",
}: {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  kind?: "primary" | "ghost";
}) {
  const cls =
    kind === "primary"
      ? "bg-brand-green text-white shadow-soft hover:brightness-105"
      : "bg-brand-slate text-white/95 hover:brightness-110";
  const base = `px-8 py-4 rounded-full text-lg font-semibold transition ${cls}`;
  return href ? (
    <Link href={href} className={base}>
      {children}
    </Link>
  ) : (
    <button onClick={onClick} className={base}>
      {children}
    </button>
  );
}
